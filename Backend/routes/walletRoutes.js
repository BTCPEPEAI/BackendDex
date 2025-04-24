const express = require('express');
const router = express.Router();
const {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  getWalletDetails,
} = require('../controllers/walletController');
const walletCtrl = require('../controllers/walletController');
const walletController = require('../controllers/walletController')

// GET /wallet?address=0x123
router.get('/', walletController.getWalletData)

// POST body: { wallet, coin }
router.post('/watchlist/add', addToWatchlist);
router.post('/watchlist/remove', removeFromWatchlist);

// GET /wallet/watchlist/:wallet
router.get('/watchlist/:wallet', getWatchlist);

// GET /wallet/:wallet/:chain
router.get('/:wallet/:chain', getWalletDetails);
router.get('/holdings', walletCtrl.getHoldings);       // /api/wallet/holdings?address=0x..&chain=eth
router.get('/txns', walletCtrl.getTransactions);       // /api/wallet/txns?address=0x..&chain=eth
router.get('/watchlist', walletCtrl.getWatchlist);     // /api/wallet/watchlist?wallet=0x..
router.post('/watchlist', walletCtrl.updateWatchlist); // POST { wallet, coins }



module.exports = router;
