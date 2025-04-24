const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  contract: { type: String, required: true, lowercase: true },
  wallet: { type: String, required: true },
  vote: { type: String, enum: ['up', 'down'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityVote', VoteSchema);
