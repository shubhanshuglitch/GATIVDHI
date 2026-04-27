"""
sliding_window.py — Sliding Window Algorithms (DAA)
=====================================================
Implements SMA, EMA, and trend detection using the sliding window technique.

Why Sliding Window?
  - Processes data in a single pass → O(n)
  - Constant memory per window → O(k) where k = window size
  - Natural fit for moving average computation
  - Real-time capable (can process streaming data)

Algorithms:
  SMA — Simple Moving Average: average of last k values
  EMA — Exponential Moving Average: weighted average favoring recent values
  Trend Detection — Golden Cross / Death Cross signals

Time Complexity: O(n) for all operations
Space Complexity: O(n) for output arrays, O(k) for window
"""

import numpy as np
import logging

logger = logging.getLogger(__name__)


def compute_sma(prices, window):
    """
    Simple Moving Average using sliding window.
    
    SMA[i] = (prices[i-k+1] + ... + prices[i]) / k
    
    Optimization: maintain running sum, add new value, subtract old.
    → No need to re-sum the entire window each step.
    
    Time Complexity: O(n)
    Space Complexity: O(n) for result, O(1) working memory
    
    Returns:
        Dict with values and step-by-step window states for visualization
    """
    prices = list(prices)
    n = len(prices)
    result = [None] * n
    steps = []  # For visualization
    
    window_sum = 0
    
    for i in range(n):
        window_sum += prices[i]
        
        if i >= window:
            window_sum -= prices[i - window]
        
        if i >= window - 1:
            avg = window_sum / window
            result[i] = round(avg, 4)
            
            # Track window state for visualization (first 30 steps)
            if len(steps) < 30:
                start = max(0, i - window + 1)
                steps.append({
                    'position': i,
                    'window_start': start,
                    'window_end': i,
                    'window_values': [round(p, 2) for p in prices[start:i + 1]],
                    'sum': round(window_sum, 2),
                    'average': round(avg, 4),
                })
    
    return {'values': result, 'window_size': window, 'steps': steps}


def compute_ema(prices, span):
    """
    Exponential Moving Average.
    
    EMA[i] = α × price[i] + (1 - α) × EMA[i-1]
    where α = 2 / (span + 1)
    
    EMA gives more weight to recent prices → reacts faster to changes.
    
    Time Complexity: O(n)
    Space Complexity: O(n) for result
    """
    prices = list(prices)
    n = len(prices)
    alpha = 2.0 / (span + 1)
    
    result = [None] * n
    result[0] = prices[0]
    
    for i in range(1, n):
        result[i] = round(alpha * prices[i] + (1 - alpha) * (result[i - 1] or prices[i]), 4)
    
    return {'values': result, 'span': span, 'alpha': round(alpha, 4)}


def compute_all_moving_averages(prices):
    """
    Compute all standard moving averages.
    
    Returns SMA and EMA for standard periods (5, 10, 20, 50 days).
    """
    sma_results = {}
    ema_results = {}
    
    for window in [5, 10, 20, 50]:
        sma = compute_sma(prices, window)
        sma_results[f'SMA_{window}'] = sma['values']
    
    for span in [12, 26]:
        ema = compute_ema(prices, span)
        ema_results[f'EMA_{span}'] = ema['values']
    
    return {
        'sma': sma_results,
        'ema': ema_results,
        'complexity': {
            'time': 'O(n) per average',
            'space': 'O(n) per average',
            'total_time': f'O({len(sma_results) + len(ema_results)} × n)',
        },
    }


def detect_crossover_signals(prices):
    """
    Detect Golden Cross and Death Cross signals.
    
    Golden Cross: short-term MA crosses ABOVE long-term MA → Bullish
    Death Cross: short-term MA crosses BELOW long-term MA → Bearish
    
    Uses SMA_20 (short) and SMA_50 (long).
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    prices = list(prices)
    n = len(prices)
    
    if n < 50:
        return {'signals': [], 'trend': 'insufficient_data'}
    
    sma_20 = compute_sma(prices, 20)['values']
    sma_50 = compute_sma(prices, 50)['values']
    
    signals = []
    
    for i in range(50, n):
        if sma_20[i] is None or sma_50[i] is None:
            continue
        if sma_20[i - 1] is None or sma_50[i - 1] is None:
            continue
        
        # Golden Cross: SMA_20 crosses above SMA_50
        if sma_20[i - 1] <= sma_50[i - 1] and sma_20[i] > sma_50[i]:
            signals.append({
                'type': 'Golden Cross',
                'day': i,
                'action': 'Buy',
                'price': round(prices[i], 2),
                'sma_20': sma_20[i],
                'sma_50': sma_50[i],
            })
        
        # Death Cross: SMA_20 crosses below SMA_50
        elif sma_20[i - 1] >= sma_50[i - 1] and sma_20[i] < sma_50[i]:
            signals.append({
                'type': 'Death Cross',
                'day': i,
                'action': 'Sell',
                'price': round(prices[i], 2),
                'sma_20': sma_20[i],
                'sma_50': sma_50[i],
            })
    
    # Current trend
    if sma_20[-1] and sma_50[-1]:
        trend = 'Bullish' if sma_20[-1] > sma_50[-1] else 'Bearish'
    else:
        trend = 'Neutral'
    
    return {
        'signals': signals,
        'trend': trend,
        'sma_20': sma_20,
        'sma_50': sma_50,
    }


def sliding_window_visualization(prices, window=10):
    """
    Generate step-by-step sliding window animation data.
    Used by the SlidingWindowVisualizer Skill component.
    
    Returns detailed state at each step for animated playback.
    """
    prices = list(prices)
    n = min(len(prices), 100)  # Limit for visualization
    prices = prices[:n]
    
    steps = []
    window_sum = 0
    
    for i in range(n):
        window_sum += prices[i]
        
        if i >= window:
            window_sum -= prices[i - window]
        
        start = max(0, i - window + 1)
        current_window = prices[start:i + 1]
        
        steps.append({
            'step': i,
            'new_value': round(prices[i], 2),
            'removed_value': round(prices[i - window], 2) if i >= window else None,
            'window_start': start,
            'window_end': i,
            'window_values': [round(v, 2) for v in current_window],
            'window_sum': round(window_sum, 2),
            'average': round(window_sum / min(i + 1, window), 4) if i >= window - 1 else None,
            'window_full': i >= window - 1,
        })
    
    return {
        'steps': steps,
        'window_size': window,
        'total_values': n,
        'complexity': {
            'time': 'O(n)',
            'space': 'O(k) where k = window size',
            'operations_per_step': 'O(1) — add new, subtract old, divide',
        },
    }
