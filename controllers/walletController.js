const Watchlist = require('../models/Watchlist');
const { getHoldingsAndTxs } = require('../services/walletService');
const { getWalletTokens, getWalletTxns } = require('../services/moralisService');
const Moralis = require('moralis').default
const Web3 = require('web3')


// Add coin to watchlist
exports.addToWatchlist = async (req, res) => {
  const { wallet, coin } = req.body;

  let list = await Watchlist.findOne({ walletAddress: wallet });
  if (!list) list = await Watchlist.create({ walletAddress: wallet, coins: [coin] });
  else if (!list.coins.includes(coin)) {
    list.coins.push(coin);
    await list.save();
  }

  res.json({ success: true, coins: list.coins });
};

// Remove coin from watchlist
exports.removeFromWatchlist = async (req, res) => {
  const { wallet, coin } = req.body;

  let list = await Watchlist.findOne({ walletAddress: wallet });
  if (list && list.coins.includes(coin)) {
    list.coins = list.coins.filter(c => c !== coin);
    await list.save();
  }

  res.json({ success: true, coins: list?.coins || [] });
};

// Get watchlist for wallet
exports.getWatchlist = async (req, res) => {
  const { wallet } = req.params;
  const list = await Watchlist.findOne({ walletAddress: wallet });
  res.json({ coins: list?.coins || [] });
};

// Get holdings and transactions (via Etherscan, etc.)
exports.getWalletDetails = async (req, res) => {
  const { wallet, chain } = req.params; // e.g., chain = 'eth', 'bsc', 'sol'
  const data = await getHoldingsAndTxs(wallet, chain);
  res.json(data);
};


exports.getHoldings = async (req, res) => {
  try {
    const { address, chain = 'eth' } = req.query;
    const tokens = await getWalletTokens(address, chain);
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { address, chain = 'eth' } = req.query;
    const txns = await getWalletTxns(address, chain);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWatchlist = async (req, res) => {
  const { wallet, coins } = req.body;
  const list = await Watchlist.findOneAndUpdate(
    { walletAddress: wallet },
    { coins },
    { upsert: true, new: true }
  );
  res.json(list);
};

exports.getWalletData = async (req, res) => {
  const address = req.query.address

  if (!address) return res.status(400).json({ message: 'Wallet address is required' })

  try {
    // Example: Fetch Watchlist from DB
    const watchlist = await Watchlist.findOne({ wallet: address }).lean()

    // Example: Fetch token balances via Moralis (or any API)
    const tokenBalances = await fetchTokenBalances(address)

    res.json({
      wallet: address,
      holdings: tokenBalances,
      watchlist: watchlist?.tokens || [],
      txns: [], // You can add TXN logic later
    })
  } catch (err) {
    console.error('Error in walletController:', err)
    res.status(500).json({ message: 'Failed to fetch wallet data', error: err.message })
  }
}