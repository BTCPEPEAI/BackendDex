const mongoose = require('mongoose');

const candleSchema = new mongoose.Schema({
  pairAddress: String,
  interval: String, // '1m', '5m', '1h', etc.
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
  timestamp: Date
});

module.exports = mongoose.model('Candle', candleSchema);
