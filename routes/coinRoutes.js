const express = require('express');
const router = express.Router();
const { searchCoins, getCategoryCoins } = require('../controllers/coinController');
const { fetchCoinDataFiltered } = require('../controllers/coinController');
const coinCtrl = require('../controllers/coinController');
const coinController = require('../controllers/coinController');


router.get('/:contract', coinCtrl.getCoinPage);       // /api/coin/:contract?chain=eth
router.post('/vote', coinCtrl.voteCoin);              // /api/coin/vote
router.get('/search', searchCoins);
router.get('/category/:category', getCategoryCoins);
router.get('/category/:category', getCoinsByCategory);
router.post('/fetch', fetchCoinDataFiltered); // POST /api/coins/fetch
router.post('/live-prices', getLivePrices); // POST /api/coins/live-prices
router.get('/top-holders', coinController.getTopHolders);      // /api/coin/top-holders?contract=...&network=...
router.get('/trade-history', coinController.getTradeHistory);  // /api/coin/trade-history?contract=...&network=...


module.exports = router;
