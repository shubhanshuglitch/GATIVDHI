const router = require('express').Router();
const axios = require('axios');
const ML = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Helper: proxy POST to ML service
const proxyPost = (path) => async (req, res) => {
  try {
    const { data } = await axios.post(`${ML}${path}`, req.body, { timeout: 120000 });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
};

// Helper: proxy GET to ML service
const proxyGet = (pathFn) => async (req, res) => {
  try {
    const { data } = await axios.get(`${ML}${pathFn(req)}`, { timeout: 60000 });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
};

// ML Predictions
router.post('/arima', proxyPost('/api/predict/arima'));
router.post('/lstm', proxyPost('/api/predict/lstm'));
router.post('/hybrid', proxyPost('/api/predict/hybrid'));

// Sentiment, Explain, Risk, Recommend
router.get('/sentiment/:ticker', proxyGet(r => `/api/sentiment/${r.params.ticker}`));
router.get('/explain/:ticker', proxyGet(r => `/api/explain/${r.params.ticker}`));
router.get('/risk/:ticker', proxyGet(r => `/api/risk/${r.params.ticker}`));
router.get('/recommend/:ticker', proxyGet(r => `/api/recommend/${r.params.ticker}`));

// RL, Backtest
router.post('/rl', proxyPost('/api/rl/train'));
router.post('/backtest', proxyPost('/api/backtest'));

// DAA Algorithms
router.post('/algorithms/moving-avg', proxyPost('/api/algorithms/moving-avg'));
router.post('/algorithms/regression', proxyPost('/api/algorithms/regression'));
router.post('/algorithms/best-trade', proxyPost('/api/algorithms/best-trade'));
router.post('/algorithms/complexity', proxyPost('/api/algorithms/complexity'));
router.post('/algorithms/compare', proxyPost('/api/algorithms/compare'));
router.post('/algorithms/visualize/sliding', proxyPost('/api/algorithms/visualize/sliding'));

// Evaluate & Chat
router.post('/evaluate', proxyPost('/api/evaluate'));
router.post('/chat', proxyPost('/api/chat'));

module.exports = router;
