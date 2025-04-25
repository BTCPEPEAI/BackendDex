const express = require('express');
const router = express.Router();
const TokenPair = require('../models/TokenPair');
const { getTopGainers } = require('../controllers/gainersController');

router.get('/', getTopGainers); // ← /api/gainers


router.get('/', async (req, res) => {
  const all = await TokenPair.find().sort({ price: -1 }).limit(100);
  const sorted = all.map(p => ({
    ...p._doc,
    change24h: (p.price / (p.open24h || p.price)) - 1
  }));

  const gainers = sorted.sort((a, b) => b.change24h - a.change24h).slice(0, 10);
  const losers = sorted.sort((a, b) => a.change24h - b.change24h).slice(0, 10);

  res.json({ gainers, losers });
});

module.exports = router;
