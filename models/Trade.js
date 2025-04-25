const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  wallet: String,
  tokenIn: String,
  tokenOut: String,
  amountIn: Number,
  amountOut: Number,
  pairAddress: String,
  txHash: { type: String, unique: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);
