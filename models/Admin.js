const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: String,
  password: String, // hashed
  isSuperAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('Admin', adminSchema);
