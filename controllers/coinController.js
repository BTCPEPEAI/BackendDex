const Coin = require('../models/Coin');
const AdminCoin = require('../models/AdminCoin');
const TrendingCoin = require('../models/TrendingCoin');
const CoinPriceCache = require('../models/CoinPriceCache');
const CommunityVote = require('../models/CommunityVote');
const { fetchFromCoinGecko } = require('../services/externalApiService');
const { getMultiplePrices } = require('../services/priceCache');
const { fetchCoinWithCache } = require('../services/coinCacheService');
const axios = require('axios');

// ✅ GET /api/coin/trending
const getTrendingCoins = async (req, res) => {
  try {
    const entry = await TrendingCoin.findOne({});
    if (!entry) return res.status(404).json({ error: 'No trending data' });

    const coins = await Coin.find({
      contractAddress: { $in: entry.coins }
    });

    res.json(coins);
  } catch (err) {
    console.error('Trending fetch error:', err.message);
    res.status(500).json({ error: 'Failed to load trending coins' });
  }
};

// ✅ GET /api/coin/search?q=...
const searchCoins = async (req, res) => {
  const { q } = req.query;
  const regex = new RegExp(q, 'i');

  const coins = await Coin.find({
    $or: [
      { name: regex },
      { symbol: regex },
      { contractAddress: regex },
    ]
  });

  res.json(coins);
};

// ✅ GET /api/coin/category/:category
const getCategoryCoins = async (req, res) => {
  const { category } = req.params;

  const adminEntry = await AdminCoin.findOne({ category });
  if (!adminEntry) return res.json([]);

  const coins = await Coin.find({ contractAddress: { $in: adminEntry.coins } });
  res.json(coins);
};

// ✅ POST /api/coin/fetch
const fetchCoinDataFiltered = async (req, res) => {
  const {
    coins = [],
    network = 'ethereum',
    limit = 50,
    query = '',
    showCharts = false,
    showAudit = false,
    showMarketCap = false,
    showDexInfo = false,
    show24hChange = false,
    showPoolCreated = false
  } = req.body;

  try {
    const limitedCoins = coins.slice(0, limit);
    const results = await Promise.all(
      limitedCoins.map(async (contract) => {
        const baseData = await fetchFromCoinGecko(contract, network);
        if (!baseData) return null;

        const result = {
          name: baseData.name,
          symbol: baseData.symbol,
          image: baseData.image,
          price: baseData.price
        };

        if (showMarketCap) result.marketCap = baseData.marketCap;
        if (show24hChange) result.change24h = baseData.change24h;
        if (showAudit) result.audit = 'Not Audited';
        if (showDexInfo) result.dex = 'DEX info here';
        if (showPoolCreated) result.poolCreated = '2023-05-01';
        if (showCharts) result.chartData = [];

        return result;
      })
    );

    res.json({ coins: results.filter(Boolean) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ✅ GET /api/coin/:contract
const getCoinPage = async (req, res) => {
  const { contract } = req.params;
  const chain = req.query.chain || 'eth';
  try {
    const cache = await CoinPriceCache.findOne({ address: contract, network: chain });
    if (!cache) return res.status(404).json({ error: 'Coin not found' });
    res.json(cache);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coin' });
  }
};

// ✅ POST /api/coin/vote
const voteCoin = async (req, res) => {
  const { contract, wallet, vote } = req.body;
  const newVote = await CommunityVote.create({ contract, wallet, vote });
  res.json(newVote);
};

// ✅ GET /api/coin/top-holders?contract=...&network=...
const getTopHolders = async (req, res) => {
  const { contract, network } = req.query;

  try {
    const response = await axios.get(`https://api.moralis.io/top-holders?chain=${network}&address=${contract}`, {
      headers: { 'X-API-Key': process.env.MORALIS_API_KEY }
    });

    const holders = response.data.slice(0, 10);
    res.json(holders);
  } catch (error) {
    console.error('Error fetching top holders:', error.message);
    res.status(500).json({ error: 'Failed to fetch top holders' });
  }
};

// ✅ GET /api/coin/trade-history?contract=...&network=...
const getTradeHistory = async (req, res) => {
  const { contract, network } = req.query;

  try {
    let apiUrl;

    if (network === 'bsc') {
      apiUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${contract}&apikey=${process.env.BSCSCAN_API_KEY}`;
    } else if (network === 'eth') {
      apiUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${contract}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    } else {
      return res.status(400).json({ error: 'Unsupported network' });
    }

    const response = await axios.get(apiUrl);
    const txns = response.data.result?.slice(0, 20);

    res.json(txns);
  } catch (error) {
    console.error('Error fetching trade history:', error.message);
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
};

// ✅ GET /api/coin/live-prices
const getLivePrices = async (req, res) => {
  try {
    const prices = await getMultiplePrices();
    res.json(prices);
  } catch (error) {
    console.error('Live Prices Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch live prices' });
  }
};

// Optional route if needed
const getCoinsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const coins = await Coin.find({ category }).limit(500);
    res.json(coins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coins' });
  }
};

module.exports = {
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
};
