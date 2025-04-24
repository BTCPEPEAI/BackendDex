// models/PriceCache.js
const mongoose = require('mongoose');

const PriceCacheSchema = new mongoose.Schema({
  contract: { type: String, required: true },
  platform: { type: String, required: true },
  price: Number,
  change24h: Number,
  marketCap: Number,
  lastUpdated: { type: Date, default: Date.now }
});

PriceCacheSchema.index({ contract: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('PriceCache', PriceCacheSchema);
