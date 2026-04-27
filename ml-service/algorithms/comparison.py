"""
comparison.py — Algorithm Comparison Module (DAA)
==================================================
Runs D&C, DP, Sliding Window, and ML models on the same dataset
and compares execution time, accuracy, and memory usage.

Purpose: Demonstrate trade-offs between algorithmic approaches
and machine learning approaches for the same problem.
"""

import numpy as np
import time
import sys
import logging

logger = logging.getLogger(__name__)


def compare_all_approaches(prices, dates=None):
    """
    Compare all approaches on the same price data.
    
    Approaches:
      1. D&C Regression — O(n log n) — piecewise trend fitting
      2. DP Buy/Sell — O(n) — optimal trading strategy
      3. Sliding Window — O(n) — moving average smoothing
      4. ARIMA — O(n×p) — statistical time series model
    
    Returns structured comparison data for the ComparisonChart Skill.
    """
    from algorithms.divide_conquer import divide_and_conquer_regression
    from algorithms.dynamic_prog import max_profit_single, max_profit_naive
    from algorithms.sliding_window import compute_sma
    from models.arima_model import predict_arima
    
    prices = np.array(prices, dtype=float)
    x = np.arange(len(prices))
    
    comparisons = []
    
    # 1. D&C Regression
    try:
        start = time.perf_counter()
        dc_result = divide_and_conquer_regression(x, prices, 30)
        dc_time = (time.perf_counter() - start) * 1000
        
        dc_preds = np.array(dc_result['predictions'])
        dc_rmse = float(np.sqrt(np.mean((prices - dc_preds) ** 2)))
        
        comparisons.append({
            'name': 'Divide & Conquer',
            'type': 'DAA Algorithm',
            'time_complexity': 'O(n log n)',
            'space_complexity': 'O(n log n)',
            'execution_time_ms': round(dc_time, 4),
            'rmse': round(dc_rmse, 4),
            'memory_bytes': sys.getsizeof(dc_result),
            'description': 'Recursive piecewise linear regression',
        })
    except Exception as e:
        logger.error(f"D&C comparison failed: {e}")
    
    # 2. DP Optimized
    try:
        start = time.perf_counter()
        dp_result = max_profit_single(prices.tolist())
        dp_time = (time.perf_counter() - start) * 1000
        
        comparisons.append({
            'name': 'Dynamic Programming',
            'type': 'DAA Algorithm',
            'time_complexity': 'O(n)',
            'space_complexity': 'O(1)',
            'execution_time_ms': round(dp_time, 4),
            'max_profit': dp_result['max_profit'],
            'memory_bytes': sys.getsizeof(dp_result),
            'description': 'Optimal single-transaction buy/sell',
        })
    except Exception as e:
        logger.error(f"DP comparison failed: {e}")
    
    # 3. Naive (for comparison)
    try:
        small_prices = prices[:min(500, len(prices))].tolist()
        start = time.perf_counter()
        naive_result = max_profit_naive(small_prices)
        naive_time = (time.perf_counter() - start) * 1000
        
        comparisons.append({
            'name': 'Naive Brute Force',
            'type': 'DAA Algorithm',
            'time_complexity': 'O(n²)',
            'space_complexity': 'O(1)',
            'execution_time_ms': round(naive_time, 4),
            'max_profit': naive_result['max_profit'],
            'memory_bytes': sys.getsizeof(naive_result),
            'description': 'Brute-force all buy/sell pairs',
        })
    except Exception as e:
        logger.error(f"Naive comparison failed: {e}")
    
    # 4. Sliding Window
    try:
        start = time.perf_counter()
        sma_result = compute_sma(prices.tolist(), 20)
        sma_time = (time.perf_counter() - start) * 1000
        
        sma_values = [v for v in sma_result['values'] if v is not None]
        actual_trimmed = prices[len(prices) - len(sma_values):]
        sma_rmse = float(np.sqrt(np.mean((actual_trimmed - np.array(sma_values)) ** 2)))
        
        comparisons.append({
            'name': 'Sliding Window (SMA)',
            'type': 'DAA Algorithm',
            'time_complexity': 'O(n)',
            'space_complexity': 'O(k)',
            'execution_time_ms': round(sma_time, 4),
            'rmse': round(sma_rmse, 4),
            'memory_bytes': sys.getsizeof(sma_result),
            'description': 'Running average with O(1) per step',
        })
    except Exception as e:
        logger.error(f"SMA comparison failed: {e}")
    
    # 5. ARIMA (ML)
    try:
        start = time.perf_counter()
        arima_result = predict_arima(prices, forecast_days=10)
        arima_time = (time.perf_counter() - start) * 1000
        
        from evaluator import evaluate_model
        arima_metrics = evaluate_model(
            arima_result['test_actual'],
            arima_result['test_predictions'],
            'ARIMA'
        )
        
        comparisons.append({
            'name': 'ARIMA',
            'type': 'ML Model',
            'time_complexity': 'O(n × p)',
            'space_complexity': 'O(n)',
            'execution_time_ms': round(arima_time, 4),
            'rmse': arima_metrics['rmse'],
            'memory_bytes': sys.getsizeof(arima_result),
            'description': 'Statistical time series forecasting',
        })
    except Exception as e:
        logger.error(f"ARIMA comparison failed: {e}")
    
    # Sort by execution time
    comparisons.sort(key=lambda x: x['execution_time_ms'])
    
    return {
        'comparisons': comparisons,
        'data_size': len(prices),
        'fastest': comparisons[0]['name'] if comparisons else 'N/A',
        'analysis': _generate_analysis(comparisons),
    }


def _generate_analysis(comparisons):
    """Generate textual analysis of comparison results."""
    if not comparisons:
        return "No algorithms could be compared."
    
    fastest = comparisons[0]
    lines = [
        f"Fastest: {fastest['name']} at {fastest['execution_time_ms']:.2f}ms",
        f"Total algorithms compared: {len(comparisons)}",
    ]
    
    daa = [c for c in comparisons if c['type'] == 'DAA Algorithm']
    ml = [c for c in comparisons if c['type'] == 'ML Model']
    
    if daa and ml:
        daa_avg = np.mean([c['execution_time_ms'] for c in daa])
        ml_avg = np.mean([c['execution_time_ms'] for c in ml])
        lines.append(f"Avg DAA time: {daa_avg:.2f}ms vs Avg ML time: {ml_avg:.2f}ms")
        lines.append(f"DAA is {ml_avg/daa_avg:.1f}x faster on average" if daa_avg < ml_avg
                     else f"ML is {daa_avg/ml_avg:.1f}x faster on average")
    
    return ' | '.join(lines)
