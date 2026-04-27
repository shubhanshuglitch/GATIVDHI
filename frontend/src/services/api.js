/**
 * api.js — API Service Layer
 * Centralized API calls to backend/ML service.
 * Skills Integration: All Skills fetch data through this service.
 */
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 120000,
});
const ML = axios.create({
  baseURL: import.meta.env.VITE_ML_URL || 'http://localhost:8000',
  timeout: 120000,
});

// Attach JWT token to requests
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers['x-auth-token'] = token;
  return cfg;
});

// ── Auth ─────────────────────────────────────────
export const register = (data) => API.post('/api/auth/register', data);
export const login = (data) => API.post('/api/auth/login', data);
export const getMe = () => API.get('/api/auth/me');

// ── Stock Data ───────────────────────────────────
export const searchStocks = (q) => ML.get(`/api/stock/search/${q}`);
export const getStock = (ticker, period = '1y') => ML.get(`/api/stock/${ticker}?period=${period}`);
export const getStockInfo = (ticker) => ML.get(`/api/stock/${ticker}/info`);

// ── ML Predictions ───────────────────────────────
export const predictARIMA = (body) => ML.post('/api/predict/arima', body);
export const predictLSTM = (body) => ML.post('/api/predict/lstm', body);
export const predictHybrid = (body) => ML.post('/api/predict/hybrid', body);

// ── Sentiment & Explain ──────────────────────────
export const getSentiment = (ticker) => ML.get(`/api/sentiment/${ticker}`);
export const getExplanation = (ticker) => ML.get(`/api/explain/${ticker}`);

// ── Recommendation & Risk ────────────────────────
export const getRecommendation = (ticker) => ML.get(`/api/recommend/${ticker}`);
export const getRisk = (ticker) => ML.get(`/api/risk/${ticker}`);

// ── RL & Backtest ────────────────────────────────
export const trainRL = (body) => ML.post('/api/rl/train', body);
export const backtest = (body) => ML.post('/api/backtest', body);

// ── DAA Algorithms ───────────────────────────────
export const algoMovingAvg = (body) => ML.post('/api/algorithms/moving-avg', body);
export const algoRegression = (body) => ML.post('/api/algorithms/regression', body);
export const algoBestTrade = (body) => ML.post('/api/algorithms/best-trade', body);
export const algoComplexity = (body) => ML.post('/api/algorithms/complexity', body);
export const algoCompare = (body) => ML.post('/api/algorithms/compare', body);
export const algoVisualizeSW = (body) => ML.post('/api/algorithms/visualize/sliding', body);

// ── Evaluate & Chat ──────────────────────────────
export const evaluateAll = (body) => ML.post('/api/evaluate', body);
export const chat = (body) => ML.post('/api/chat', body);
