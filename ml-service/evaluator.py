"""
evaluator.py — Model Evaluation & Comparison Module
====================================================
Computes RMSE, MAE, R², MAPE for all models and provides ranked comparison.
"""

import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import logging

logger = logging.getLogger(__name__)


def evaluate_model(actual, predicted, model_name="Model"):
    """
    Compute evaluation metrics for a model.
    
    Metrics:
      RMSE — Root Mean Squared Error (penalizes large errors)
      MAE  — Mean Absolute Error (average absolute deviation)
      R²   — Coefficient of Determination (1 = perfect fit)
      MAPE — Mean Absolute Percentage Error (scale-independent)
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    actual = np.array(actual, dtype=float)
    predicted = np.array(predicted, dtype=float)
    
    # Ensure same length
    min_len = min(len(actual), len(predicted))
    actual = actual[:min_len]
    predicted = predicted[:min_len]
    
    rmse = float(np.sqrt(mean_squared_error(actual, predicted)))
    mae = float(mean_absolute_error(actual, predicted))
    r2 = float(r2_score(actual, predicted)) if len(actual) > 1 else 0.0
    
    # MAPE (avoid division by zero)
    mask = actual != 0
    if mask.any():
        mape = float(np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100)
    else:
        mape = 0.0
    
    metrics = {
        "model": model_name,
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "r2": round(r2, 4),
        "mape": round(mape, 4),
        "samples": int(min_len),
    }
    
    logger.info(f"{model_name}: RMSE={rmse:.4f}, MAE={mae:.4f}, R²={r2:.4f}, MAPE={mape:.2f}%")
    return metrics


def compare_models(evaluations: list) -> dict:
    """
    Rank models by multiple metrics and determine the best overall.
    
    Ranking logic:
      - Lower RMSE is better
      - Lower MAE is better
      - Higher R² is better
      - Lower MAPE is better
    
    Returns comparison table with rankings.
    """
    if not evaluations:
        return {"error": "No evaluations to compare"}
    
    # Sort by different metrics
    by_rmse = sorted(evaluations, key=lambda x: x.get('rmse', float('inf')))
    by_mae = sorted(evaluations, key=lambda x: x.get('mae', float('inf')))
    by_r2 = sorted(evaluations, key=lambda x: x.get('r2', 0), reverse=True)
    by_mape = sorted(evaluations, key=lambda x: x.get('mape', float('inf')))
    
    # Compute average rank for each model
    model_ranks = {}
    for rank_list in [by_rmse, by_mae, by_r2, by_mape]:
        for i, m in enumerate(rank_list):
            name = m['model']
            model_ranks.setdefault(name, []).append(i + 1)
    
    avg_ranks = {name: np.mean(ranks) for name, ranks in model_ranks.items()}
    best_model = min(avg_ranks, key=avg_ranks.get)
    
    return {
        "models": evaluations,
        "rankings": {
            "by_rmse": [m['model'] for m in by_rmse],
            "by_mae": [m['model'] for m in by_mae],
            "by_r2": [m['model'] for m in by_r2],
            "by_mape": [m['model'] for m in by_mape],
        },
        "average_rank": {k: round(v, 2) for k, v in avg_ranks.items()},
        "best_overall": best_model,
    }
