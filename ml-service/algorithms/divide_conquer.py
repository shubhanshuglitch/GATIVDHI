"""
divide_conquer.py — Divide & Conquer Regression (DAA)
======================================================
Splits dataset recursively, applies linear regression on subproblems,
then merges piecewise results.

Algorithm:
  1. DIVIDE: Split data at midpoint
  2. CONQUER: Apply linear regression on each half recursively
  3. MERGE: Combine piecewise predictions
  
  Base case: segment size <= min_segment_size → fit single regression

Why D&C for Regression?
  - Captures local trends that global regression misses
  - Natural for piecewise-linear data (stock trends change)
  - Recursion depth = O(log n) → manageable tree

Recurrence: T(n) = 2T(n/2) + O(n)  [Master theorem Case 2]
Time Complexity: O(n log n)
Space Complexity: O(n log n) for recursion tree storage
"""

import numpy as np
from sklearn.linear_model import LinearRegression
import logging

logger = logging.getLogger(__name__)


def divide_and_conquer_regression(x, y, min_segment_size=30, depth=0, tree=None):
    """
    Piecewise linear regression via divide and conquer.
    
    Args:
        x: Array of indices (0 to n-1)
        y: Array of prices
        min_segment_size: Minimum points per segment (base case)
        depth: Current recursion depth (for tree tracking)
        tree: List to accumulate recursion tree nodes
    
    Returns:
        Dict with predictions, segments, recursion tree
    """
    x = np.array(x, dtype=float)
    y = np.array(y, dtype=float)
    
    if tree is None:
        tree = []
    
    predictions = np.zeros(len(y))
    segments = []
    
    def _recurse(start, end, depth):
        """Recursive D&C helper."""
        n = end - start
        
        # Track recursion tree node
        tree.append({
            'depth': depth,
            'start': int(start),
            'end': int(end),
            'size': int(n),
            'type': 'leaf' if n <= min_segment_size else 'internal',
        })
        
        # BASE CASE: small enough segment → fit single regression
        if n <= min_segment_size or n < 4:
            x_seg = x[start:end].reshape(-1, 1)
            y_seg = y[start:end]
            
            model = LinearRegression()
            model.fit(x_seg, y_seg)
            preds = model.predict(x_seg)
            predictions[start:end] = preds
            
            segments.append({
                'start': int(start),
                'end': int(end),
                'slope': round(float(model.coef_[0]), 6),
                'intercept': round(float(model.intercept_), 4),
                'trend': 'up' if model.coef_[0] > 0 else 'down',
            })
            return
        
        # DIVIDE: split at midpoint
        mid = (start + end) // 2
        
        # CONQUER: recurse on both halves
        _recurse(start, mid, depth + 1)
        _recurse(mid, end, depth + 1)
        
        # MERGE: predictions are already written in-place
        # Smooth the junction point to avoid discontinuity
        if mid > start and mid < end:
            # Average the predictions at the boundary
            blend_size = min(3, mid - start, end - mid)
            for i in range(blend_size):
                w = (i + 1) / (blend_size + 1)
                idx = mid - blend_size + i
                if 0 <= idx < len(predictions):
                    predictions[idx] = predictions[idx] * (1 - w * 0.3) + predictions[min(idx + 1, len(predictions) - 1)] * (w * 0.3)
    
    _recurse(0, len(y), 0)
    
    logger.info(f"D&C regression: {len(segments)} segments, max depth={max(t['depth'] for t in tree)}")
    
    return {
        'predictions': predictions.tolist(),
        'segments': segments,
        'num_segments': len(segments),
        'recursion_tree': tree,
        'max_depth': max(t['depth'] for t in tree),
        'complexity': {
            'time': 'O(n log n)',
            'space': 'O(n log n)',
            'recurrence': 'T(n) = 2T(n/2) + O(n)',
        },
    }


def predict_future_dc(x, y, forecast_days=30):
    """
    Forecast using the trend of the last segment.
    
    Uses the slope from the most recent D&C segment
    to extrapolate future prices.
    """
    x = np.array(x, dtype=float)
    y = np.array(y, dtype=float)
    
    # Fit on last segment
    segment_size = min(60, len(y))
    x_last = x[-segment_size:].reshape(-1, 1)
    y_last = y[-segment_size:]
    
    model = LinearRegression()
    model.fit(x_last, y_last)
    
    # Extrapolate
    future_x = np.arange(len(y), len(y) + forecast_days).reshape(-1, 1)
    future_preds = model.predict(future_x)
    
    trend = 'bullish' if model.coef_[0] > 0 else 'bearish'
    
    return {
        'future_predictions': future_preds.tolist(),
        'trend_direction': trend,
        'slope': round(float(model.coef_[0]), 6),
        'forecast_days': forecast_days,
    }
