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
  getTradeHistory
} = require('../controllers/coinController');

const { getCoinsByCategory, getCoinDetails } = require('../controllers/coinController');

// /api/coins/category/trending
router.get('/category/:category', getCoinsByCategory);

// /api/coin/:contract
router.get('/:contract', getCoinDetails);

// Public Routes
router.get('/search', searchCoins);
router.get('/category/:category', getCategoryCoins);
router.post('/fetch', fetchCoinDataFiltered);
router.post('/live-prices', getLivePrices);
router.get('/top-holders', getTopHolders);
router.get('/trade-history', getTradeHistory);
router.get('/trending', getTrendingCoins);

// Dynamic
router.get('/:contract', getCoinPage);
router.post('/vote', voteCoin);

module.exports = router;
