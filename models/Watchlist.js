const mongoose = require('mongoose')

const WatchlistSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  tokens: [{ type: String }] // List of token addresses or symbols
})

module.exports = mongoose.model('Watchlist', WatchlistSchema)
