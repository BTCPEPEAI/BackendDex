const express = require('express');
const router = express.Router();
const Candle = require('../models/Candle');
const { getCandles } = require('../controllers/candleController');

router.get('/:address', getCandles);

router.get('/:pairAddress', async (req, res) => {
  const candles = await Candle.find({ pairAddress: req.params.pairAddress })
    .sort({ timestamp: -1 })
    .limit(60);

  res.json(candles.reverse()); // oldest to newest
});

module.exports = router;
