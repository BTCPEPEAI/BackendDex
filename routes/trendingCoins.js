const express = require('express');
const router = express.Router();
const trendingCoinsController = require('../controllers/trendingCoinsController');

// Get all trending coins
router.get('/', trendingCoinsController.getTrendingCoins);

// Add a new coin to trending
router.post('/', trendingCoinsController.addTrendingCoin);

// Update position or move coin between column/box
router.put('/:id', trendingCoinsController.updateTrendingCoin);

// Delete a coin from trending
router.delete('/:id', trendingCoinsController.deleteTrendingCoin);

module.exports = router;
