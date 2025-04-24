const express = require('express');
const router = express.Router();
const { fetchCoinMetrics } = require('../controllers/coinMetricsController');

router.get('/:contract', fetchCoinMetrics); // /api/coin-metrics/:contract?platform=bsc

module.exports = router;
