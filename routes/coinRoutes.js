const express = require('express');
const router = express.Router();

const {
  getLivePrices,
  searchCoins,
  getCategoryCoins,
  fetchCoinDataFiltered,
  getCoinPage,
  voteCoin,
  getTopHolders,
  getTradeHistory,
  getTrendingCoins,
  getCoinDetails
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

// Coin-specific Routes
router.get('/coin/:contract', getCoinDetails);
router.get('/:contract', getCoinPage);

module.exports = router;
