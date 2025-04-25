const mongoose = require('mongoose');

const CoinPriceCacheSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  network: { type: String, default: 'ethereum' },
  price: Number,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CoinPriceCache', CoinPriceCacheSchema);
