const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');

// Top 10 trending pairs based on recent trades
router.get('/', async (req, res) => {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000); // past 1h

  const trending = await Trade.aggregate([
    { $match: { timestamp: { $gte: cutoff } } },
    { $group: { _id: '$pairAddress', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json(trending);
});

module.exports = router;
