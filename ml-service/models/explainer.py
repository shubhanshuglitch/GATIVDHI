"""
explainer.py — Explainable AI (XAI) Module
============================================
Provides feature importance and model explanations using
permutation importance (model-agnostic approach).

Why Explainable AI?
  - Black-box ML models lack transparency
  - Financial decisions need justification
  - Regulatory compliance requires explainability
  - Builds trust in model predictions

Approach: Permutation Feature Importance
  - Shuffle each feature independently
  - Measure accuracy drop → feature importance
  - Model-agnostic (works with any model)

Time Complexity: O(features × n × model_inference)
Space Complexity: O(features × n)
"""

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance
import logging

logger = logging.getLogger(__name__)


def explain_predictions(prices, features_df):
    """
    Generate feature importance explanations.
    
    Uses a RandomForest as a proxy model to compute feature importances,
    since LSTM/ARIMA don't natively support feature importance.
    
    Args:
        prices: Array of closing prices
        features_df: DataFrame with technical indicators
    
    Returns:
        Dict with feature importances and explanations
    """
    import pandas as pd
    
    feature_cols = [
        'SMA_5', 'SMA_10', 'SMA_20', 'SMA_50',
        'EMA_12', 'EMA_26', 'RSI_14',
        'MACD', 'MACD_Signal', 'MACD_Histogram',
        'Daily_Return', 'Volatility_20'
    ]
    
    # Filter available columns
    available = [c for c in feature_cols if c in features_df.columns]
    
    if len(available) < 3:
        return _fallback_explanation(prices)
    
    # Prepare data
    df = features_df[available].copy()
    df = df.fillna(method='ffill').fillna(method='bfill').fillna(0)
    
    # Target: next-day price change
    target = np.diff(prices)
    df = df.iloc[:len(target)]
    target = target[:len(df)]
    
    X = df.values
    y = target
    
    # Train proxy model (RandomForest)
    model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    model.fit(X, y)
    
    # Feature importance (built-in)
    importances = model.feature_importances_
    
    # Permutation importance
    try:
        perm_imp = permutation_importance(model, X, y, n_repeats=10, random_state=42)
        perm_importances = perm_imp.importances_mean
    except Exception:
        perm_importances = importances
    
    # Build explanation
    feature_explanations = []
    for i, feat in enumerate(available):
        feature_explanations.append({
            'feature': feat,
            'importance': round(float(importances[i]), 4),
            'permutation_importance': round(float(perm_importances[i]), 4),
            'description': _feature_description(feat),
        })
    
    # Sort by importance
    feature_explanations.sort(key=lambda x: x['importance'], reverse=True)
    
    # Top factors
    top_3 = feature_explanations[:3]
    reasoning = _generate_reasoning(top_3, prices)
    
    return {
        'features': feature_explanations,
        'top_features': top_3,
        'reasoning': reasoning,
        'model_type': 'RandomForest (proxy)',
        'r2_score': round(float(model.score(X, y)), 4),
    }


def _fallback_explanation(prices):
    """Simple explanation when feature data is insufficient."""
    prices = np.array(prices)
    recent_trend = 'upward' if prices[-1] > prices[-5] else 'downward'
    volatility = float(np.std(np.diff(prices) / prices[:-1]))
    
    return {
        'features': [
            {'feature': 'Recent Trend', 'importance': 0.4, 'description': f'{recent_trend} trend'},
            {'feature': 'Volatility', 'importance': 0.3, 'description': f'{volatility:.4f} daily std'},
            {'feature': 'Price Level', 'importance': 0.3, 'description': f'Current: {prices[-1]:.2f}'},
        ],
        'top_features': [],
        'reasoning': f'Price shows {recent_trend} trend with {volatility:.2%} volatility.',
        'model_type': 'Basic Analysis',
    }


def _feature_description(feature):
    """Human-readable description of each feature."""
    descriptions = {
        'SMA_5': '5-day Simple Moving Average (short-term trend)',
        'SMA_10': '10-day Simple Moving Average',
        'SMA_20': '20-day Simple Moving Average (medium-term trend)',
        'SMA_50': '50-day Simple Moving Average (long-term trend)',
        'EMA_12': '12-day Exponential Moving Average (fast)',
        'EMA_26': '26-day Exponential Moving Average (slow)',
        'RSI_14': 'Relative Strength Index (overbought/oversold indicator)',
        'MACD': 'Moving Average Convergence Divergence (trend momentum)',
        'MACD_Signal': 'MACD Signal Line (trading signal trigger)',
        'MACD_Histogram': 'MACD Histogram (momentum change rate)',
        'Daily_Return': 'Daily price change percentage',
        'Volatility_20': '20-day rolling volatility (risk measure)',
    }
    return descriptions.get(feature, feature)


def _generate_reasoning(top_features, prices):
    """Generate human-readable reasoning from top features."""
    parts = []
    for f in top_features:
        parts.append(f"{f['feature']} ({f['description']}) has {f['importance']:.1%} influence")
    
    trend = 'upward' if prices[-1] > prices[-10] else 'downward'
    parts.append(f"Overall {trend} trend detected in recent prices")
    
    return '. '.join(parts) + '.'
