# 🚀 GATIVIDHI — AI-Driven Stock Market Prediction & Algorithm Analysis System

A production-level academic project combining **AIML** (Artificial Intelligence & Machine Learning) and **DAA** (Design & Analysis of Algorithms) coursework requirements.

## 📦 Architecture

```
UI (React+Vite) → Backend (Node+Express) → ML Service (Python+FastAPI) → MongoDB
     :5173              :5000                       :8000
```

**Stitch MCP**: Layout orchestration in `frontend/src/stitch/`  
**Skills System**: Reusable components in `frontend/src/skills/`

## 🧠 AIML Features
| Feature | Module | Description |
|---------|--------|-------------|
| **ARIMA** | `models/arima_model.py` | Linear time series forecasting |
| **LSTM** | `models/lstm_model.py` | Deep learning (2-layer, 50 units) |
| **Hybrid** | `models/hybrid_model.py` | ARIMA + LSTM ensemble |
| **Sentiment** | `models/sentiment.py` | VADER news sentiment analysis |
| **RL Agent** | `models/rl_agent.py` | Q-learning trading agent |
| **Explainable AI** | `models/explainer.py` | Permutation feature importance |
| **Buy/Sell** | `/api/recommend/{ticker}` | RSI, MACD, SMA-based signals |
| **Backtesting** | `/api/backtest` | Historical strategy simulation |
| **Risk Analysis** | `/api/risk/{ticker}` | Volatility, Sharpe, Max Drawdown |

## ⚙️ DAA Features
| Algorithm | Module | Complexity | Description |
|-----------|--------|-----------|-------------|
| **D&C Regression** | `algorithms/divide_conquer.py` | O(n log n) | Recursive piecewise regression |
| **DP Buy/Sell** | `algorithms/dynamic_prog.py` | O(n) vs O(n²) | Naive vs optimized comparison |
| **Sliding Window** | `algorithms/sliding_window.py` | O(n) | SMA, EMA, trend detection |
| **Complexity Bench** | `algorithms/complexity.py` | — | Runtime on increasing sizes |
| **Comparison** | `algorithms/comparison.py` | — | DAA vs ML benchmarking |

## 🖥️ Dashboard Panels
1. **Stock Prediction** — ARIMA/LSTM/Hybrid with charts
2. **Buy/Sell Recommendation** — RSI, MACD signals + confidence
3. **Sentiment Analysis** — News headlines + VADER scores
4. **Algorithm Visualization** — D&C tree, DP table, sliding window animation
5. **Complexity Analysis** — Big-O graphs, runtime benchmarks
6. **Backtesting** — Historical trading simulation
7. **Risk Meter** — Volatility, Sharpe ratio, drawdown
8. **Chatbot** — Natural language stock queries

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+, **Python** 3.9+, **MongoDB** (optional)

### Install
```powershell
.\install-deps.ps1
# Or manually:
cd ml-service && pip install -r requirements.txt
cd ../backend && npm install
cd ../frontend && npm install
```

### Run
```powershell
.\start-all.ps1
# Or manually in 3 terminals:
cd ml-service && python -m uvicorn app:app --port 8000 --reload
cd backend && npm start
cd frontend && npm run dev
```

### Access
- Frontend: **http://localhost:5173**
- Backend: **http://localhost:5000**
- ML Service: **http://localhost:8000**

## 📊 Evaluation Metrics
- **RMSE** — Root Mean Squared Error
- **MAE** — Mean Absolute Error
- **R²** — Coefficient of Determination
- **MAPE** — Mean Absolute Percentage Error
- **Execution Time** — Algorithm runtime in ms
- **Memory Usage** — Bytes consumed

## 🎓 Academic Notes

### Why each model/algorithm is used:
- **ARIMA**: Best for linear trends, fast, interpretable
- **LSTM**: Captures non-linear patterns, handles long-term dependencies
- **Hybrid**: Combines strengths of both (linear + non-linear)
- **D&C**: Natural for piecewise data; O(n log n) via Master Theorem
- **DP**: Demonstrates O(n²) → O(n) optimization for buy/sell
- **Sliding Window**: O(1) per step for running averages

### Trade-offs:
- DAA algorithms: Fast, deterministic, limited pattern recognition
- ML models: Slow training, powerful pattern recognition, black-box

## 📄 License
MIT
