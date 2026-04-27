const router = require('express').Router();
const axios = require('axios');
const ML = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Proxy to ML service stock endpoints
router.get('/search/:query', async (req, res) => {
  try {
    const { data } = await axios.get(`${ML}/api/stock/search/${req.params.query}`);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

router.get('/:ticker', async (req, res) => {
  try {
    const period = req.query.period || '1y';
    const { data } = await axios.get(`${ML}/api/stock/${req.params.ticker}?period=${period}`);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

router.get('/:ticker/info', async (req, res) => {
  try {
    const { data } = await axios.get(`${ML}/api/stock/${req.params.ticker}/info`);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

module.exports = router;
