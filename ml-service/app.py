"""
GATIVIDHI — FastAPI ML Microservice
All prediction, algorithm, sentiment, RL, and analysis endpoints.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np, pandas as pd, logging, time

from data_collector import fetch_stock_data, fetch_news, get_stock_info, search_stocks
from preprocessor import preprocess_for_model, add_features, handle_missing_values
from models.arima_model import predict_arima
from models.lstm_model import train_lstm, predict_lstm, forecast_future
from models.hybrid_model import predict_hybrid
from models.sentiment import analyze_sentiment
from models.rl_agent import train_rl_agent
from models.explainer import explain_predictions
from algorithms.divide_conquer import divide_and_conquer_regression, predict_future_dc
from algorithms.dynamic_prog import max_profit_single, max_profit_unlimited, max_profit_k_transactions, max_profit_naive
from algorithms.sliding_window import compute_all_moving_averages, detect_crossover_signals, sliding_window_visualization
from algorithms.complexity import run_complexity_analysis
from algorithms.comparison import compare_all_approaches
from evaluator import evaluate_model, compare_models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GATIVIDHI ML Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# ── Request Models ───────────────────────────────────────────────────────
class PredReq(BaseModel):
    ticker: str; period: str = "2y"; forecast_days: int = 30
class ARIMAReq(PredReq):
    order_p: int = 5; order_d: int = 1; order_q: int = 0
class LSTMReq(PredReq):
    epochs: int = 10; batch_size: int = 32; sequence_length: int = 60
class HybridReq(PredReq):
    lstm_epochs: int = 5; sequence_length: int = 60
class TradeReq(BaseModel):
    ticker: str; period: str = "1y"; max_transactions: int = 2
class TickerReq(BaseModel):
    ticker: str; period: str = "1y"
class ComplexityReq(BaseModel):
    max_size: int = 5000
class ChatReq(BaseModel):
    message: str; ticker: str = ""

# ── Stock Data ───────────────────────────────────────────────────────────
@app.get("/api/stock/search/{query}")
async def api_search(query: str):
    return {"query": query, "results": search_stocks(query)}

@app.get("/api/stock/{ticker}")
async def api_stock(ticker: str, period: str = "1y"):
    try:
        df = fetch_stock_data(ticker, period)
        df_feat = add_features(df.copy())
        return {"ticker": ticker.upper(), "period": period, "count": len(df),
                "data": df.to_dict(orient="records"), "features": df_feat.to_dict(orient="records")}
    except ValueError as e:
        raise HTTPException(404, str(e))

@app.get("/api/stock/{ticker}/info")
async def api_info(ticker: str):
    try: return get_stock_info(ticker)
    except ValueError as e: raise HTTPException(404, str(e))

# ── ML Predictions ───────────────────────────────────────────────────────
@app.post("/api/predict/arima")
async def api_arima(req: ARIMAReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        result = predict_arima(df['Close'].values, req.forecast_days, (req.order_p, req.order_d, req.order_q))
        metrics = evaluate_model(result['test_actual'], result['test_predictions'], "ARIMA")
        return {"ticker": req.ticker.upper(), "model": "ARIMA", "dates": df['Date'].tolist(),
                **result, "metrics": metrics}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/api/predict/lstm")
async def api_lstm(req: LSTMReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        proc = preprocess_for_model(df, 'Close', req.sequence_length)
        model, hist = train_lstm(proc['X_train'], proc['y_train'], proc['X_test'], proc['y_test'],
                                  req.epochs, req.batch_size, req.sequence_length)
        test_preds = predict_lstm(model, proc['X_test'], proc['scaler'])
        test_actual = proc['scaler'].inverse_transform(proc['y_test'].reshape(-1,1)).flatten()
        last_seq = proc['normalized'][-req.sequence_length:].flatten()
        future = forecast_future(model, last_seq, proc['scaler'], req.forecast_days)
        metrics = evaluate_model(test_actual, test_preds, "LSTM")
        return {"ticker": req.ticker.upper(), "model": "LSTM", "dates": df['Date'].tolist(),
                "test_actual": test_actual.tolist(), "test_predictions": test_preds,
                "future_forecast": future, "metrics": metrics,
                "training": {"epochs": len(hist.history['loss']),
                             "train_loss": [float(x) for x in hist.history['loss']],
                             "val_loss": [float(x) for x in hist.history['val_loss']]}}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/api/predict/hybrid")
async def api_hybrid(req: HybridReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        result = predict_hybrid(df['Close'].values, req.forecast_days, lstm_epochs=req.lstm_epochs)
        metrics_arima = evaluate_model(result['test_actual'], result['arima_predictions'], "ARIMA")
        metrics_hybrid = evaluate_model(result['test_actual'], result['hybrid_predictions'], "Hybrid")
        return {"ticker": req.ticker.upper(), "model": "Hybrid ARIMA+LSTM",
                "dates": df['Date'].tolist(), **result,
                "metrics_arima": metrics_arima, "metrics_hybrid": metrics_hybrid}
    except Exception as e: raise HTTPException(500, str(e))

# ── Sentiment ────────────────────────────────────────────────────────────
@app.get("/api/sentiment/{ticker}")
async def api_sentiment(ticker: str):
    try:
        news = fetch_news(ticker)
        analysis = analyze_sentiment(news)
        return {"ticker": ticker.upper(), **analysis}
    except Exception as e: raise HTTPException(500, str(e))

# ── Explainability ───────────────────────────────────────────────────────
@app.get("/api/explain/{ticker}")
async def api_explain(ticker: str):
    try:
        df = fetch_stock_data(ticker, "1y")
        df_feat = add_features(df.copy())
        result = explain_predictions(df['Close'].values, df_feat)
        return {"ticker": ticker.upper(), **result}
    except Exception as e: raise HTTPException(500, str(e))

# ── RL Agent ─────────────────────────────────────────────────────────────
@app.post("/api/rl/train")
async def api_rl(req: TickerReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        result = train_rl_agent(df['Close'].values.tolist(), episodes=200)
        result['dates'] = df['Date'].tolist()
        result['prices'] = df['Close'].tolist()
        return {"ticker": req.ticker.upper(), **result}
    except Exception as e: raise HTTPException(500, str(e))

# ── Backtesting ──────────────────────────────────────────────────────────
@app.post("/api/backtest")
async def api_backtest(req: TickerReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        prices = df['Close'].tolist(); dates = df['Date'].tolist()
        signals = detect_crossover_signals(prices)
        cash = 10000.0; shares = 0; portfolio = [cash]; trades = []
        for sig in signals.get('signals', []):
            day = sig['day']; price = prices[day]
            if sig['action'] == 'Buy' and cash > 0:
                shares = cash / price; cash = 0
                trades.append({**sig, 'date': dates[day], 'shares': round(shares,4)})
            elif sig['action'] == 'Sell' and shares > 0:
                cash = shares * price; pnl = round(cash - 10000, 2); shares = 0
                trades.append({**sig, 'date': dates[day], 'pnl': pnl})
        final = cash + shares * prices[-1]
        bh_return = ((prices[-1] - prices[0]) / prices[0]) * 100
        return {"ticker": req.ticker.upper(), "trades": trades, "final_value": round(final, 2),
                "total_return_pct": round(((final-10000)/10000)*100, 2),
                "buy_hold_return_pct": round(bh_return, 2), "dates": dates, "prices": prices}
    except Exception as e: raise HTTPException(500, str(e))

# ── Risk Analysis ────────────────────────────────────────────────────────
@app.get("/api/risk/{ticker}")
async def api_risk(ticker: str):
    try:
        df = fetch_stock_data(ticker, "1y")
        prices = df['Close'].values; returns = np.diff(prices) / prices[:-1]
        vol = float(np.std(returns)); ann_vol = vol * np.sqrt(252)
        sharpe = float(np.mean(returns) / vol * np.sqrt(252)) if vol > 0 else 0
        max_dd = 0; peak = prices[0]
        for p in prices:
            if p > peak: peak = p
            dd = (peak - p) / peak
            if dd > max_dd: max_dd = dd
        risk_score = min(100, int(ann_vol * 200))
        level = "Low" if risk_score < 30 else ("Medium" if risk_score < 60 else "High")
        return {"ticker": ticker.upper(), "volatility_daily": round(vol,6),
                "volatility_annual": round(ann_vol,4), "sharpe_ratio": round(sharpe,4),
                "max_drawdown_pct": round(max_dd*100,2), "risk_score": risk_score,
                "risk_level": level,
                "suggestion": f"{'Conservative allocation recommended' if risk_score > 60 else 'Moderate allocation suitable' if risk_score > 30 else 'Suitable for growth portfolio'}"}
    except Exception as e: raise HTTPException(500, str(e))

# ── Buy/Sell Recommendation ─────────────────────────────────────────────
@app.get("/api/recommend/{ticker}")
async def api_recommend(ticker: str):
    try:
        df = fetch_stock_data(ticker, "1y")
        feat = add_features(df.copy())
        last = feat.iloc[-1]; price = float(last['Close'])
        rsi = float(last.get('RSI_14', 50)); macd_h = float(last.get('MACD_Histogram', 0))
        sma20 = float(last.get('SMA_20', price)); sma50 = float(last.get('SMA_50', price))
        score = 0; reasons = []
        if rsi < 30: score += 2; reasons.append(f"RSI={rsi:.1f} oversold → Buy signal")
        elif rsi > 70: score -= 2; reasons.append(f"RSI={rsi:.1f} overbought → Sell signal")
        else: reasons.append(f"RSI={rsi:.1f} neutral")
        if macd_h > 0: score += 1; reasons.append("MACD histogram positive → Bullish")
        else: score -= 1; reasons.append("MACD histogram negative → Bearish")
        if price > sma20: score += 1; reasons.append("Price above SMA20 → Uptrend")
        else: score -= 1; reasons.append("Price below SMA20 → Downtrend")
        if price > sma50: score += 1; reasons.append("Price above SMA50 → Long-term bullish")
        else: score -= 1; reasons.append("Price below SMA50 → Long-term bearish")
        if score >= 3: action, conf = "Strong Buy", 0.9
        elif score >= 1: action, conf = "Buy", 0.7
        elif score <= -3: action, conf = "Strong Sell", 0.9
        elif score <= -1: action, conf = "Sell", 0.7
        else: action, conf = "Hold", 0.5
        return {"ticker": ticker.upper(), "action": action, "confidence": conf,
                "score": score, "reasons": reasons, "price": round(price,2),
                "indicators": {"rsi": round(rsi,2), "macd_histogram": round(macd_h,4),
                               "sma_20": round(sma20,2), "sma_50": round(sma50,2)}}
    except Exception as e: raise HTTPException(500, str(e))

# ── DAA Algorithms ───────────────────────────────────────────────────────
@app.post("/api/algorithms/moving-avg")
async def api_ma(req: TickerReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        prices = df['Close'].tolist()
        return {"ticker": req.ticker.upper(), "dates": df['Date'].tolist(), "prices": prices,
                "moving_averages": compute_all_moving_averages(prices),
                "signals": detect_crossover_signals(prices)}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/api/algorithms/regression")
async def api_dc(req: TickerReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        prices = df['Close'].values; x = np.arange(len(prices))
        result = divide_and_conquer_regression(x, prices, 30)
        future = predict_future_dc(x, prices, 30)
        metrics = evaluate_model(prices, result['predictions'], "D&C Regression")
        return {"ticker": req.ticker.upper(), "dates": df['Date'].tolist(),
                "actual_prices": prices.tolist(), **result, "future": future, "metrics": metrics}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/api/algorithms/best-trade")
async def api_trade(req: TradeReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        prices = df['Close'].tolist(); dates = df['Date'].tolist()
        single = max_profit_single(prices)
        naive = max_profit_naive(prices[:min(500, len(prices))])
        k_trans = max_profit_k_transactions(prices, req.max_transactions)
        unlimited = max_profit_unlimited(prices)
        for r in [single, k_trans, unlimited]:
            for t in r.get('transactions', []):
                if 'buy_index' in t and 0 <= t['buy_index'] < len(dates): t['buy_date'] = dates[t['buy_index']]
                if 'sell_index' in t and 0 <= t['sell_index'] < len(dates): t['sell_date'] = dates[t['sell_index']]
        return {"ticker": req.ticker.upper(), "dates": dates, "prices": prices,
                "naive": naive, "single": single, "k_transactions": k_trans, "unlimited": unlimited}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/api/algorithms/complexity")
async def api_complexity(req: ComplexityReq):
    try: return run_complexity_analysis(req.max_size)
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/api/algorithms/compare")
async def api_compare(req: TickerReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        return {"ticker": req.ticker.upper(), **compare_all_approaches(df['Close'].values, df['Date'].tolist())}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/api/algorithms/visualize/sliding")
async def api_vis_sliding(req: TickerReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        return {"ticker": req.ticker.upper(), **sliding_window_visualization(df['Close'].tolist(), 10)}
    except Exception as e: raise HTTPException(500, str(e))

# ── Evaluate All ─────────────────────────────────────────────────────────
@app.post("/api/evaluate")
async def api_evaluate(req: TickerReq):
    try:
        df = fetch_stock_data(req.ticker, req.period)
        prices = df['Close'].values; evals = []
        try:
            r = predict_arima(prices, 30); evals.append(evaluate_model(r['test_actual'], r['test_predictions'], "ARIMA"))
        except: pass
        try:
            x = np.arange(len(prices)); r = divide_and_conquer_regression(x, prices, 30)
            evals.append(evaluate_model(prices, r['predictions'], "D&C Regression"))
        except: pass
        return {"ticker": req.ticker.upper(), "comparison": compare_models(evals) if evals else {"error": "No models evaluated"}}
    except Exception as e: raise HTTPException(500, str(e))

# ── Chatbot ──────────────────────────────────────────────────────────────
@app.post("/api/chat")
async def api_chat(req: ChatReq):
    msg = req.message.lower(); ticker = req.ticker or "AAPL"
    try:
        if any(w in msg for w in ['price', 'current', 'how much']):
            df = fetch_stock_data(ticker, "5d")
            p = df['Close'].iloc[-1]
            return {"response": f"{ticker.upper()} is currently trading at ₹{p:.2f}", "type": "price"}
        elif any(w in msg for w in ['buy', 'sell', 'recommend']):
            return {"response": f"Let me check {ticker.upper()} indicators... Use the Recommendation panel for a detailed Buy/Sell/Hold analysis.", "type": "recommendation"}
        elif any(w in msg for w in ['predict', 'forecast', 'future']):
            return {"response": f"Run ARIMA or LSTM prediction on the Prediction panel for {ticker.upper()} forecast.", "type": "prediction"}
        elif any(w in msg for w in ['risk', 'volatile', 'safe']):
            return {"response": f"Check the Risk Analysis panel for {ticker.upper()} volatility, Sharpe ratio, and risk score.", "type": "risk"}
        elif any(w in msg for w in ['sentiment', 'news']):
            return {"response": f"Check the Sentiment panel for latest {ticker.upper()} news analysis.", "type": "sentiment"}
        else:
            return {"response": f"I can help with: price info, buy/sell recommendations, predictions, risk analysis, and sentiment for {ticker.upper()}. What would you like to know?", "type": "help"}
    except Exception as e:
        return {"response": f"Sorry, I encountered an error: {str(e)}", "type": "error"}

# ── Health ───────────────────────────────────────────────────────────────
@app.get("/")
async def health():
    return {"status": "healthy", "service": "GATIVIDHI ML Service", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn; uvicorn.run(app, host="0.0.0.0", port=8000)
