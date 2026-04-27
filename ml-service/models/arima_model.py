"""
arima_model.py — ARIMA Time Series Forecasting
================================================
ARIMA(p,d,q): AutoRegressive Integrated Moving Average

Why ARIMA?
  - Captures linear trends and autocorrelations in time series
  - Works well for short-term forecasting
  - Interpretable parameters (p=AR order, d=differencing, q=MA order)

Trade-offs vs LSTM:
  - Faster training (no neural network)
  - Better for linear patterns
  - Struggles with non-linear, complex patterns
  - No feature learning — relies on manual feature selection

Time Complexity: O(n * p) for fitting
Space Complexity: O(n)
"""

import numpy as np
from statsmodels.tsa.arima.model import ARIMA
import warnings
import logging

warnings.filterwarnings('ignore')
logger = logging.getLogger(__name__)


def predict_arima(prices, forecast_days=30, order=(5, 1, 0), train_ratio=0.8):
    """
    Train ARIMA model and generate predictions + future forecast.
    
    Args:
        prices: Array of closing prices
        forecast_days: Number of future days to predict
        order: (p, d, q) ARIMA parameters
        train_ratio: Train/test split ratio
    
    Returns:
        Dict with train_data, test_actual, test_predictions, future_forecast
    """
    prices = np.array(prices, dtype=float)
    split_idx = int(len(prices) * train_ratio)
    
    train = prices[:split_idx]
    test = prices[split_idx:]
    
    # Fit ARIMA on training data
    try:
        model = ARIMA(train, order=order)
        fitted = model.fit()
        
        # Predict on test period
        test_preds = fitted.forecast(steps=len(test))
        test_preds = np.array(test_preds, dtype=float)
        
        # Forecast future
        full_model = ARIMA(prices, order=order)
        full_fitted = full_model.fit()
        future = full_fitted.forecast(steps=forecast_days)
        future = np.array(future, dtype=float)
        
        logger.info(f"ARIMA{order} trained on {len(train)} points, predicting {len(test)} + {forecast_days}")
        
        return {
            'train_data': train.tolist(),
            'test_actual': test.tolist(),
            'test_predictions': test_preds.tolist(),
            'future_forecast': future.tolist(),
            'order': list(order),
        }
    except Exception as e:
        logger.error(f"ARIMA failed: {e}")
        # Fallback: simple moving average prediction
        window = min(30, len(prices))
        avg = float(np.mean(prices[-window:]))
        return {
            'train_data': train.tolist(),
            'test_actual': test.tolist(),
            'test_predictions': [avg] * len(test),
            'future_forecast': [avg] * forecast_days,
            'order': list(order),
            'fallback': True,
        }
