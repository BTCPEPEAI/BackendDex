const express = require('express');
const router = express.Router();

const {
  getTrendingCoins,
  getLivePrices,
  searchCoins,
  getCategoryCoins,
  fetchCoinDataFiltered,
  getCoinPage,
  voteCoin,
  getTopHolders,
  getTradeHistory,
  getCoinsByCategory
} = require('../controllers/coinController');

// Public Routes
router.get('/search', searchCoins);
router.get('/category/:category', getCategoryCoins);
router.get('/top-holders', getTopHolders);
router.get('/trade-history', getTradeHistory);
router.get('/trending', getTrendingCoins);
router.post('/fetch', fetchCoinDataFiltered);
router.post('/live-prices', getLivePrices);
router.post('/vote', voteCoin);

// Coin-specific
router.get('/:contract', getCoinPage);

// Optional additional route (if you still want)
router.get('/coins-by/:category', getCoinsByCategory);

module.exports = router;
