const mongoose = require('mongoose');

const StockDataSchema = new mongoose.Schema({
  ticker: { type: String, required: true, index: true },
  period: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  fetchedAt: { type: Date, default: Date.now },
});

StockDataSchema.index({ ticker: 1, period: 1 });
module.exports = mongoose.model('StockData', StockDataSchema);
