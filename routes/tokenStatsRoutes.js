const express = require('express');
const router = express.Router();
const { fetchTokenStats } = require('../controllers/tokenStatsController');

router.get('/:contract', fetchTokenStats); // /api/token-stats/:contract?network=bsc

module.exports = router;
