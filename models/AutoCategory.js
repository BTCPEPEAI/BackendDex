const mongoose = require('mongoose');

const autoCategorySchema = new mongoose.Schema({
  category: String, // "gainers", "trending", etc.
  coins: [String], // contract addresses
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AutoCategory', autoCategorySchema);
