const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');

// Get all ads
router.get('/', async (req, res) => {
  const ads = await Ad.find().sort({ createdAt: -1 });
  res.json(ads);
});

// Create a new ad
router.post('/', async (req, res) => {
  const ad = new Ad(req.body);
  await ad.save();
  res.json({ message: 'Ad created', ad });
});

// Update an ad
router.put('/:id', async (req, res) => {
  const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: 'Ad updated', ad });
});

// Delete an ad
router.delete('/:id', async (req, res) => {
  await Ad.findByIdAndDelete(req.params.id);
  res.json({ message: 'Ad deleted' });
});

module.exports = router;
