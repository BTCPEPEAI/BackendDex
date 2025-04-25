// models/TokenPair.js
const mongoose = require('mongoose');

const TokenPairSchema = new mongoose.Schema({
  pairAddress: { type: String, unique: true },
  token0: String,
  token1: String,
  token0Symbol: String,
  token1Symbol: String,
  reserve0: String,
  reserve1: String,
  price: Number,
  volumeUSD: { type: Number, default: 0 }, // 🆕 Add this
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TokenPair', TokenPairSchema);
