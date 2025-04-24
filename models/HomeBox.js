const mongoose = require('mongoose');

const homeBoxSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['trending', 'gainers', 'new', 'hot-pairs'],
    required: true
  },
  coins: [String], // array of contract addresses
  network: {
    type: String,
    default: 'ethereum'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HomeBox', homeBoxSchema);
