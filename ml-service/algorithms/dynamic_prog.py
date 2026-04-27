"""
dynamic_prog.py — Dynamic Programming Stock Trading (DAA)
==========================================================
Implements optimal buy/sell strategies using DP.

Problems Implemented:
  1. Single Transaction (Kadane's variant) — O(n)
  2. Unlimited Transactions (Greedy) — O(n)  
  3. K Transactions (DP table) — O(n × k)
  4. Naive Brute Force — O(n²)

Academic Comparison:
  Naive O(n²) vs Optimized O(n) — demonstrates algorithmic improvement

DP Table Visualization:
  Returns step-by-step table filling for the AlgorithmVisualizer skill
"""

import numpy as np
import time
import logging

logger = logging.getLogger(__name__)


def max_profit_naive(prices):
    """
    NAIVE BRUTE FORCE — O(n²) time, O(1) space
    
    Try every (buy, sell) pair where buy < sell.
    This is intentionally inefficient to demonstrate
    the improvement of the DP approach.
    
    Steps tracked for visualization.
    """
    prices = list(prices)
    n = len(prices)
    max_profit = 0
    best_buy = best_sell = 0
    comparisons = 0
    steps = []
    
    start_time = time.perf_counter()
    
    for i in range(n):
        for j in range(i + 1, n):
            comparisons += 1
            profit = prices[j] - prices[i]
            
            if comparisons <= 50:  # Track first 50 steps for visualization
                steps.append({
                    'buy_idx': i, 'sell_idx': j,
                    'profit': round(profit, 2),
                    'is_best': profit > max_profit,
                })
            
            if profit > max_profit:
                max_profit = profit
                best_buy, best_sell = i, j
    
    elapsed = time.perf_counter() - start_time
    
    return {
        'max_profit': round(max_profit, 2),
        'buy_index': best_buy,
        'sell_index': best_sell,
        'buy_price': round(prices[best_buy], 2),
        'sell_price': round(prices[best_sell], 2),
        'comparisons': comparisons,
        'execution_time_ms': round(elapsed * 1000, 4),
        'complexity': 'O(n²)',
        'steps': steps,
        'transactions': [{
            'buy_index': best_buy, 'sell_index': best_sell,
            'buy_price': round(prices[best_buy], 2),
            'sell_price': round(prices[best_sell], 2),
            'profit': round(max_profit, 2),
        }] if max_profit > 0 else [],
    }


def max_profit_single(prices):
    """
    OPTIMIZED SINGLE TRANSACTION — O(n) time, O(1) space
    
    Track minimum price seen so far, compute max profit at each step.
    Kadane's algorithm variant.
    
    DP Recurrence:
      min_price[i] = min(min_price[i-1], prices[i])
      max_profit[i] = max(max_profit[i-1], prices[i] - min_price[i])
    
    Steps tracked for DP table visualization.
    """
    prices = list(prices)
    n = len(prices)
    
    start_time = time.perf_counter()
    
    min_price = prices[0]
    max_profit = 0
    best_buy = best_sell = 0
    current_min_idx = 0
    
    # DP table for visualization
    dp_table = []
    
    for i in range(1, n):
        if prices[i] < min_price:
            min_price = prices[i]
            current_min_idx = i
        
        profit = prices[i] - min_price
        
        if i <= 100:  # Track steps for visualization
            dp_table.append({
                'day': i,
                'price': round(prices[i], 2),
                'min_so_far': round(min_price, 2),
                'potential_profit': round(profit, 2),
                'max_profit': round(max(max_profit, profit), 2),
            })
        
        if profit > max_profit:
            max_profit = profit
            best_buy = current_min_idx
            best_sell = i
    
    elapsed = time.perf_counter() - start_time
    
    return {
        'max_profit': round(max_profit, 2),
        'buy_index': best_buy,
        'sell_index': best_sell,
        'buy_price': round(prices[best_buy], 2),
        'sell_price': round(prices[best_sell], 2),
        'execution_time_ms': round(elapsed * 1000, 4),
        'complexity': 'O(n)',
        'dp_table': dp_table,
        'transactions': [{
            'buy_index': best_buy, 'sell_index': best_sell,
            'buy_price': round(prices[best_buy], 2),
            'sell_price': round(prices[best_sell], 2),
            'profit': round(max_profit, 2),
        }] if max_profit > 0 else [],
    }


def max_profit_unlimited(prices):
    """
    UNLIMITED TRANSACTIONS — O(n) time, O(1) space
    
    Greedy: capture every upward price movement.
    Buy at every valley, sell at every peak.
    """
    prices = list(prices)
    n = len(prices)
    
    start_time = time.perf_counter()
    
    total_profit = 0
    transactions = []
    
    i = 0
    while i < n - 1:
        # Find valley (local minimum)
        while i < n - 1 and prices[i + 1] <= prices[i]:
            i += 1
        buy_idx = i
        
        # Find peak (local maximum)
        while i < n - 1 and prices[i + 1] >= prices[i]:
            i += 1
        sell_idx = i
        
        if sell_idx > buy_idx:
            profit = prices[sell_idx] - prices[buy_idx]
            total_profit += profit
            transactions.append({
                'buy_index': buy_idx,
                'sell_index': sell_idx,
                'buy_price': round(prices[buy_idx], 2),
                'sell_price': round(prices[sell_idx], 2),
                'profit': round(profit, 2),
            })
        
        i += 1
    
    elapsed = time.perf_counter() - start_time
    
    return {
        'max_profit': round(total_profit, 2),
        'num_transactions': len(transactions),
        'transactions': transactions,
        'execution_time_ms': round(elapsed * 1000, 4),
        'complexity': 'O(n)',
    }


def max_profit_k_transactions(prices, k=2):
    """
    AT MOST K TRANSACTIONS — O(n × k) time, O(n × k) space
    
    DP Table:
      dp[i][j] = max profit using at most i transactions up to day j
    
    Recurrence:
      dp[i][j] = max(dp[i][j-1], max(prices[j] - prices[m] + dp[i-1][m]) for m in 0..j-1)
    
    Optimized with running max to avoid O(n²k) inner loop.
    Returns full DP table for visualization.
    """
    prices = list(prices)
    n = len(prices)
    
    if n < 2:
        return {'max_profit': 0, 'transactions': [], 'dp_table': []}
    
    start_time = time.perf_counter()
    
    # DP table: (k+1) × n
    dp = [[0] * n for _ in range(k + 1)]
    dp_steps = []  # For visualization
    
    for i in range(1, k + 1):
        max_diff = -prices[0]  # Running max of (dp[i-1][m] - prices[m])
        
        for j in range(1, n):
            dp[i][j] = max(dp[i][j - 1], prices[j] + max_diff)
            max_diff = max(max_diff, dp[i - 1][j] - prices[j])
            
            # Track steps for visualization (limit to manageable size)
            if i <= 3 and j <= 50:
                dp_steps.append({
                    'transaction': i,
                    'day': j,
                    'value': round(dp[i][j], 2),
                    'max_diff': round(max_diff, 2),
                })
    
    # Backtrack to find actual transactions
    transactions = _backtrack_transactions(dp, prices, k)
    
    elapsed = time.perf_counter() - start_time
    
    # Format DP table for visualization
    dp_table_formatted = []
    for i in range(k + 1):
        dp_table_formatted.append({
            'transaction': i,
            'values': [round(v, 2) for v in dp[i][:min(n, 100)]],
        })
    
    return {
        'max_profit': round(dp[k][n - 1], 2),
        'k': k,
        'transactions': transactions,
        'dp_table': dp_table_formatted,
        'dp_steps': dp_steps,
        'execution_time_ms': round(elapsed * 1000, 4),
        'complexity': f'O(n × k) = O({n} × {k})',
    }


def _backtrack_transactions(dp, prices, k):
    """Backtrack through DP table to find actual buy/sell pairs."""
    n = len(prices)
    transactions = []
    
    # Simple backtracking
    remaining = dp[k][n - 1]
    sell_idx = n - 1
    
    for i in range(k, 0, -1):
        if remaining <= 0:
            break
        
        # Find sell point
        while sell_idx > 0 and dp[i][sell_idx] == dp[i][sell_idx - 1]:
            sell_idx -= 1
        
        # Find buy point
        buy_idx = sell_idx - 1
        while buy_idx > 0 and dp[i][buy_idx] != dp[i - 1][buy_idx]:
            buy_idx -= 1
        
        if buy_idx >= 0 and sell_idx > buy_idx:
            profit = prices[sell_idx] - prices[buy_idx]
            if profit > 0:
                transactions.append({
                    'buy_index': buy_idx,
                    'sell_index': sell_idx,
                    'buy_price': round(prices[buy_idx], 2),
                    'sell_price': round(prices[sell_idx], 2),
                    'profit': round(profit, 2),
                })
                remaining -= profit
        
        sell_idx = buy_idx - 1
    
    transactions.reverse()
    return transactions
