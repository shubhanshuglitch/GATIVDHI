"""
sentiment.py — News Sentiment Analysis (NLP)
=============================================
Uses VADER (Valence Aware Dictionary and sEntiment Reasoner) for sentiment scoring.

Why VADER?
  - Specifically tuned for social media/news text
  - No training required (lexicon-based)
  - Fast inference O(n) per sentence
  - Good for financial sentiment (handles modifiers, negations)

Sentiment Integration:
  - Positive sentiment → bullish adjustment to prediction
  - Negative sentiment → bearish adjustment
  - Neutral → no adjustment

Time Complexity: O(articles × avg_words_per_article)
Space Complexity: O(articles)
"""

import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import logging

logger = logging.getLogger(__name__)

analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(headlines: list) -> dict:
    """
    Analyze sentiment of news headlines.
    
    Args:
        headlines: List of headline strings or dicts with 'title' key
    
    Returns:
        Dict with individual scores, aggregate score, and recommendation
    """
    results = []
    
    for item in headlines:
        title = item if isinstance(item, str) else item.get('title', '')
        if not title:
            continue
        
        scores = analyzer.polarity_scores(title)
        results.append({
            'headline': title,
            'positive': round(scores['pos'], 4),
            'negative': round(scores['neg'], 4),
            'neutral': round(scores['neu'], 4),
            'compound': round(scores['compound'], 4),
            'label': _classify_sentiment(scores['compound']),
            'source': item.get('source', 'Unknown') if isinstance(item, dict) else 'Unknown',
        })
    
    if not results:
        return {
            'articles': [],
            'aggregate': {'score': 0, 'label': 'Neutral', 'confidence': 0},
            'summary': {'positive': 0, 'negative': 0, 'neutral': 0},
        }
    
    # Aggregate sentiment
    compounds = [r['compound'] for r in results]
    avg_compound = float(np.mean(compounds))
    
    pos_count = sum(1 for r in results if r['label'] == 'Positive')
    neg_count = sum(1 for r in results if r['label'] == 'Negative')
    neu_count = sum(1 for r in results if r['label'] == 'Neutral')
    
    return {
        'articles': results,
        'aggregate': {
            'score': round(avg_compound, 4),
            'label': _classify_sentiment(avg_compound),
            'confidence': round(abs(avg_compound), 4),
        },
        'summary': {
            'positive': pos_count,
            'negative': neg_count,
            'neutral': neu_count,
            'total': len(results),
        },
        'recommendation': _sentiment_recommendation(avg_compound),
    }


def _classify_sentiment(compound: float) -> str:
    """Classify compound score into Positive/Negative/Neutral."""
    if compound >= 0.05:
        return 'Positive'
    elif compound <= -0.05:
        return 'Negative'
    return 'Neutral'


def _sentiment_recommendation(score: float) -> dict:
    """Generate trading recommendation based on sentiment."""
    if score >= 0.3:
        return {'action': 'Strong Buy', 'reason': 'Very positive news sentiment', 'weight': 0.8}
    elif score >= 0.1:
        return {'action': 'Buy', 'reason': 'Positive news sentiment', 'weight': 0.6}
    elif score <= -0.3:
        return {'action': 'Strong Sell', 'reason': 'Very negative news sentiment', 'weight': 0.8}
    elif score <= -0.1:
        return {'action': 'Sell', 'reason': 'Negative news sentiment', 'weight': 0.6}
    return {'action': 'Hold', 'reason': 'Neutral news sentiment', 'weight': 0.3}
