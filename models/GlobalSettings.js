const mongoose = require('mongoose');

const GlobalSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: [String],
});

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);
