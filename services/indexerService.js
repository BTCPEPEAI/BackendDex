const axios = require('axios');
const Coin = require('../models/Coin'); // Your MongoDB model

const API_SOURCES = [
  {
    name: 'CoinGecko',
    url: (address, network) => `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`,
  },
  {
    name: 'Dexscreener',
    url: (address) => `https://api.dexscreener.com/latest/dex/pairs/${address}`,
  },
  {
    name: 'CoinCap',
    url: (symbol) => `https://rest.coincap.io/v3/assets?apiKey=62cf1b6a373acd5cc34a0981168e90e1d2190fa37ca163ee73ce47fb0a1be741`,
  }
  // Add more if needed
];

const fetchWithFallback = async (address, network, symbol = '') => {
  for (let source of API_SOURCES) {
    try {
      const url = source.url(address, network, symbol);
      const res = await axios.get(url);
      if (res.data) {
        return { source: source.name, data: res.data };
      }
    } catch (err) {
      console.log(`❌ ${source.name} failed:`, err.response?.status || err.message);
    }
  }

  return null; // All sources failed
};

const fetchCoinData = async (address, network = 'ethereum', symbol = '') => {
  // Check if recently cached
  const existing = await Coin.findOne({ address });
  const now = Date.now();
  if (existing && now - existing.lastFetched < 1000 * 30) {
    return existing;
  }

  const result = await fetchWithFallback(address, network, symbol);
  if (!result) throw new Error('All APIs failed');

  const coinData = {
    address,
    network,
    symbol: symbol || result.data.symbol || 'unknown',
    price: result.data.priceUsd || result.data.price || result.data.data?.priceUsd || 0,
    lastFetched: now,
  };

  await Coin.findOneAndUpdate({ address }, coinData, { upsert: true });

  return coinData;
};

module.exports = {
  fetchCoinData,
};
