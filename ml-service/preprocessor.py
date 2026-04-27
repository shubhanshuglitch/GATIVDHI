"""
preprocessor.py — Data Preprocessing & Feature Engineering
===========================================================
Handles missing values, technical indicators, normalization, and LSTM sequences.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import logging

logger = logging.getLogger(__name__)


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Forward-fill, backward-fill, then drop remaining NaN. O(n) time."""
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].ffill().bfill()
    return df.dropna()


def compute_rsi(prices: np.ndarray, period: int = 14) -> np.ndarray:
    """RSI: 0-100. >70=overbought, <30=oversold. O(n) time, O(n) space."""
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = np.mean(gains[:period])
    avg_loss = np.mean(losses[:period])
    rsi = np.full(len(prices), 50.0)
    for i in range(period, len(deltas)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        if avg_loss == 0:
            rsi[i + 1] = 100.0
        else:
            rsi[i + 1] = 100.0 - (100.0 / (1.0 + avg_gain / avg_loss))
    return rsi


def compute_macd(prices: np.ndarray, fast=12, slow=26, signal=9):
    """MACD line, signal line, histogram. O(n) time."""
    def ema(data, period):
        alpha = 2.0 / (period + 1)
        result = np.zeros(len(data))
        result[0] = data[0]
        for i in range(1, len(data)):
            result[i] = alpha * data[i] + (1 - alpha) * result[i - 1]
        return result
    ema_fast = ema(prices, fast)
    ema_slow = ema(prices, slow)
    macd_line = ema_fast - ema_slow
    signal_line = ema(macd_line, signal)
    return macd_line, signal_line, macd_line - signal_line


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add SMA, EMA, RSI, MACD, Bollinger, returns, volatility. O(n) per indicator."""
    df = df.copy()
    prices = df['Close'].values
    for w in [5, 10, 20, 50]:
        df[f'SMA_{w}'] = df['Close'].rolling(window=w, min_periods=1).mean()
    df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
    df['EMA_26'] = df['Close'].ewm(span=26, adjust=False).mean()
    df['RSI_14'] = compute_rsi(prices, 14)
    macd, signal, hist = compute_macd(prices)
    df['MACD'] = macd
    df['MACD_Signal'] = signal
    df['MACD_Histogram'] = hist
    df['Daily_Return'] = df['Close'].pct_change().fillna(0)
    df['Volatility_20'] = df['Daily_Return'].rolling(window=20, min_periods=1).std()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].round(4).fillna(0)
    return df


def normalize_data(data: np.ndarray):
    """MinMaxScaler to [0,1]. Returns (normalized, scaler). O(n)."""
    scaler = MinMaxScaler(feature_range=(0, 1))
    normalized = scaler.fit_transform(data.reshape(-1, 1))
    return normalized, scaler


def split_data(data: np.ndarray, train_ratio=0.8):
    """Sequential train/test split (preserves temporal order)."""
    idx = int(len(data) * train_ratio)
    return data[:idx], data[idx:]


def create_sequences(data: np.ndarray, sequence_length=60):
    """Create sliding-window sequences for LSTM. O(n*seq_len)."""
    X, y = [], []
    flat = data.flatten()
    for i in range(sequence_length, len(flat)):
        X.append(flat[i - sequence_length:i])
        y.append(flat[i])
    X = np.array(X).reshape(-1, sequence_length, 1)
    return X, np.array(y)


def preprocess_for_model(df, column='Close', sequence_length=60, train_ratio=0.8):
    """Full pipeline: normalize → sequences → train/test split."""
    prices = df[column].values.astype(float)
    normalized, scaler = normalize_data(prices)
    X, y = create_sequences(normalized, sequence_length)
    s = int(len(X) * train_ratio)
    return {
        'X_train': X[:s], 'X_test': X[s:],
        'y_train': y[:s], 'y_test': y[s:],
        'scaler': scaler, 'normalized': normalized,
        'original_prices': prices, 'sequence_length': sequence_length,
    }
