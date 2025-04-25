// routes/autoCategory.js
const express = require('express');
const router = express.Router();
const AutoCategory = require('../models/AutoCategory');

router.get('/:category', async (req, res) => {
  const { category } = req.params;
  const data = await AutoCategory.findOne({ category });
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

module.exports = router;
