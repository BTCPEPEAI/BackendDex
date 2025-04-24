const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: String,
  logo: String,
  type: String, // "trending", "top-gainers", etc.
  contractAddress: String,
  network: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: Date
});

const ApplicationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['logo-update', 'project-submission', 'trending-request', 'ad-request'], 
    required: true 
  },
  data: { type: Object }, // dynamic fields (project name, logo URL, etc.)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
