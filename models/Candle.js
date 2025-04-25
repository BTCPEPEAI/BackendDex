const mongoose = require('mongoose');

const candleSchema = new mongoose.Schema({
  address: String,
  timestamp: Date,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
});

module.exports = mongoose.model('Candle', candleSchema);
