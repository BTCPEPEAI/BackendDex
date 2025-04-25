const express = require('express');
const router = express.Router();

const {
  getLivePrices,
  searchCoins,
  getCategoryCoins,
  fetchCoinDataFiltered,
  getCoinPage,
  voteCoin,
  getTrendingCoins, 
  getTopHolders,
  getTradeHistory
} = require('../controllers/coinController');

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
