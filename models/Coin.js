const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  name: String,
  symbol: String,
  contractAddress: String,
  category: String, // trending, gainer, new, etc.
  price: Number,
  marketCap: Number,
  volume24h: Number,
  auditStatus: String,
  network: String,
  lastFetched: Number,
  chain: String,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coin', coinSchema);
