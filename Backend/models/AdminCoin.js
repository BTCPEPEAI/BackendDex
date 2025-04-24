const mongoose = require('mongoose');

const adminCoinSchema = new mongoose.Schema({
  category: { type: String, required: true },
  coins: [String], // contract addresses
});

module.exports = mongoose.model('AdminCoin', adminCoinSchema);
