const express = require('express');
const router = express.Router();
const TokenPair = require('../models/TokenPair');

router.get('/pairs', async (req, res) => {
  const pairs = await TokenPair.find().sort({ createdAt: -1 }).limit(50);
  res.json(pairs);
});

module.exports = router;
