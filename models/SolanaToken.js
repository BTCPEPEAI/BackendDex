const mongoose = require('mongoose');

const SolanaTokenSchema = new mongoose.Schema({
  chainId: Number,
  address: String,
  symbol: String,
  name: String,
  decimals: Number,
  logoURI: String,
  tags: [String],
});

module.exports = mongoose.model('SolanaToken', SolanaTokenSchema);
