const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, required: true },
  page: { type: String, required: true }, // home, coin, profile, etc.
  position: { type: String, required: true }, // header, sidebar, footer, between-content
  network: { type: String, default: 'eth' }, // eth, bsc, sol, etc.
  active: { type: Boolean, default: true },
  expiryDate: { type: Date }, // Optional, if passed → not active
}, { timestamps: true });

module.exports = mongoose.model('Ad', AdSchema);
