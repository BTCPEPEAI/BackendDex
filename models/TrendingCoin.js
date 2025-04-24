// models/TrendingCoin.js
const mongoose = require('mongoose');

const trendingCoinSchema = new mongoose.Schema({
  coinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coin', required: true },
  position: { type: Number, required: true },
  inTrendingBox: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('TrendingCoin', trendingCoinSchema);
