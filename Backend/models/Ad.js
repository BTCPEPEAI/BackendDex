const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['banner', 'box', 'sidebar'], default: 'box' },
  placement: { type: String }, // e.g., homepage, trendingPage, coinPage
  imageUrl: String,
  targetUrl: String,
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', AdSchema);
