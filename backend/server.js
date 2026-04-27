/**
 * GATIVIDHI Backend Server
 * Express.js API proxy with JWT auth and MongoDB
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/predictions', require('./routes/predictions'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'GATIVIDHI Backend', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ GATIVIDHI Backend running on http://localhost:${PORT}`);
});
