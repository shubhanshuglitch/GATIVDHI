"""
complexity.py — Algorithm Complexity Benchmarking (DAA)
=======================================================
Benchmarks algorithms on increasing dataset sizes to empirically
verify theoretical time complexity.

Tested Algorithms:
  1. Naive buy/sell: Expected O(n²)
  2. DP buy/sell: Expected O(n)
  3. Sliding window SMA: Expected O(n)
  4. D&C regression: Expected O(n log n)

Output:
  - Execution time vs input size data points
  - Memory usage estimates
  - Empirical vs theoretical complexity comparison

Time Complexity: O(Σ sizes × algorithm_complexity)
"""

import numpy as np
import time
import sys
import logging

logger = logging.getLogger(__name__)


def benchmark_algorithm(func, sizes, *args, **kwargs):
    """
    Run an algorithm on increasing data sizes and record performance.
    
    Args:
        func: Algorithm function to benchmark
        sizes: List of input sizes to test
        *args, **kwargs: Additional arguments for the function
    
    Returns:
        List of {size, time_ms, memory_bytes} dicts
    """
    results = []
    
    for size in sizes:
        # Generate random price data
        prices = np.random.uniform(50, 500, size).tolist()
        
        # Measure time
        start_time = time.perf_counter()
        try:
            func(prices, *args, **kwargs)
        except Exception:
            pass
        elapsed = time.perf_counter() - start_time
        
        # Estimate memory (approximate)
        memory = sys.getsizeof(prices) + size * 8  # float64
        
        results.append({
            'size': size,
            'time_ms': round(elapsed * 1000, 4),
            'memory_bytes': memory,
        })
    
    return results


def run_complexity_analysis(max_size=5000):
    """
    Full complexity analysis comparing all algorithms.
    
    Returns benchmark data for all algorithms on same input sizes.
    """
    from .dynamic_prog import max_profit_naive, max_profit_single
    from .sliding_window import compute_sma
    from .divide_conquer import divide_and_conquer_regression
    
    # Input sizes — adjusted to avoid very slow naive runs
    sizes = [50, 100, 250, 500, 1000, 2000]
    if max_size >= 5000:
        sizes.append(5000)
    
    results = {}
    
    # 1. Naive O(n²)
    naive_sizes = [s for s in sizes if s <= 2000]  # Cap naive at 2000
    logger.info("Benchmarking Naive O(n²)...")
    results['naive_brute_force'] = {
        'data': benchmark_algorithm(max_profit_naive, naive_sizes),
        'theoretical': 'O(n²)',
        'description': 'Brute-force all buy/sell pairs',
    }
    
    # 2. DP O(n)
    logger.info("Benchmarking DP O(n)...")
    results['dp_optimized'] = {
        'data': benchmark_algorithm(max_profit_single, sizes),
        'theoretical': 'O(n)',
        'description': 'Single-pass with min tracking',
    }
    
    # 3. Sliding Window O(n)
    logger.info("Benchmarking Sliding Window O(n)...")
    def sma_wrapper(prices):
        return compute_sma(prices, 20)
    results['sliding_window'] = {
        'data': benchmark_algorithm(sma_wrapper, sizes),
        'theoretical': 'O(n)',
        'description': 'Moving average with running sum',
    }
    
    # 4. D&C O(n log n)
    logger.info("Benchmarking D&C O(n log n)...")
    def dc_wrapper(prices):
        x = np.arange(len(prices))
        return divide_and_conquer_regression(x, np.array(prices), 30)
    results['divide_conquer'] = {
        'data': benchmark_algorithm(dc_wrapper, sizes),
        'theoretical': 'O(n log n)',
        'description': 'Recursive piecewise regression',
    }
    
    # Summary comparison
    summary = _generate_summary(results)
    
    return {
        'algorithms': results,
        'sizes_tested': sizes,
        'summary': summary,
    }


def _generate_summary(results):
    """Generate textual summary of complexity analysis."""
    summary = []
    
    for name, data in results.items():
        benchmarks = data['data']
        if len(benchmarks) >= 2:
            # Compute growth rate
            t1 = benchmarks[0]['time_ms']
            t2 = benchmarks[-1]['time_ms']
            n1 = benchmarks[0]['size']
            n2 = benchmarks[-1]['size']
            
            if t1 > 0:
                growth = t2 / t1
                size_growth = n2 / n1
                
                summary.append({
                    'algorithm': name,
                    'theoretical': data['theoretical'],
                    'smallest_time_ms': t1,
                    'largest_time_ms': t2,
                    'time_growth_factor': round(growth, 2),
                    'size_growth_factor': round(size_growth, 2),
                })
    
    return summary
