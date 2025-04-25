const express = require('express');
const router = express.Router();
const Candle = require('../models/Candle');

// GET /api/chart/:pair/:interval
router.get('/:pair/:interval', async (req, res) => {
  const { pair, interval } = req.params;

  const candles = await Candle.find({ pairAddress: pair, interval })
    .sort({ timestamp: 1 })
    .limit(100);

  res.json(candles);
});

module.exports = router;
