// jobs/priceUpdater.js

const axios = require('axios');
const Coin = require('../models/Coin');

const COINCAP_API = 'https://api.coincap.io/v2/assets';
const cache = new Set(); // cache to avoid duplicate fetch

async function fetchPriceFromCoinGecko(symbol) {
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: symbol.toLowerCase(),
        vs_currencies: 'usd'
      }
    });
    const price = data[symbol.toLowerCase()]?.usd;
    return price || null;
  } catch (error) {
    console.error(`⚠️ CoinGecko failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

async function fetchPriceFromCoinCap(symbol) {
  try {
    const { data } = await axios.get(COINCAP_API);
    const coin = data.data.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
    return coin?.priceUsd || null;
  } catch (error) {
    console.error(`⚠️ CoinCap failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

async function updatePrices() {
  try {
    const coins = await Coin.find({}, 'symbol');

    for (const coin of coins) {
      if (!coin.symbol || cache.has(coin.symbol)) continue;
      cache.add(coin.symbol);

      let price = await fetchPriceFromCoinGecko(coin.symbol);

      if (!price) {
        console.log(`🔄 Trying CoinCap for ${coin.symbol}`);
        price = await fetchPriceFromCoinCap(coin.symbol);
      }

      if (!price) {
        console.log(`⚠️ Failed to update price for ${coin.symbol}`);
        continue;
      }

      await Coin.updateOne(
        { symbol: coin.symbol },
        { $set: { price: parseFloat(price), updatedAt: new Date() } }
      );

      console.log(`✅ Price updated: ${coin.symbol} → $${parseFloat(price).toFixed(6)}`);
    }
  } catch (error) {
    console.error('❌ Error updating prices:', error.message);
  }
}

function startPriceUpdater() {
  console.log('⏱️ Price updater started...');
  updatePrices();
  setInterval(() => {
    cache.clear(); // Clear cache every round to allow fresh updates
    updatePrices();
  }, 10000); // Update every 10 seconds
}

module.exports = { startPriceUpdater };
