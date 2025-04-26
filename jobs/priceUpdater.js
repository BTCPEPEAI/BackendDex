// /jobs/priceUpdater.js

const Coin = require('../models/Coin');
const CoinPriceCache = require('../models/CoinPriceCache');
const axios = require('axios');

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Fetch price from Dexscreener
async function fetchPriceFromDexscreener(address) {
  try {
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    if (response.data.pairs && response.data.pairs.length > 0) {
      const price = parseFloat(response.data.pairs[0].priceUsd);
      if (!isNaN(price)) return price;
    }
    return null;
  } catch (error) {
    console.error(`⚠️ Dexscreener error for ${address}:`, error.response?.status || error.message);
    return null;
  }
}

// Fetch price from Coingecko
async function fetchPriceFromCoingecko(symbol) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    const price = response.data[symbol]?.usd;
    if (!price || price === 0) return null;
    return price;
  } catch (error) {
    console.error(`⚠️ Coingecko error for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

// Update prices
async function updateCoinPrices() {
  console.log('⏱️ Price updater started...');

  const coins = await Coin.find({ price: { $gt: 0 } }).limit(5000); // avoid dead coins
  
  for (const coin of coins) {
    try {
      let price = null;

      if (coin.contractAddress) {
        price = await fetchPriceFromDexscreener(coin.contractAddress);
        await delay(1200); // wait 1.2 seconds after API call
      }

      if (!price && coin.symbol) {
        price = await fetchPriceFromCoingecko(coin.symbol.toLowerCase());
        await delay(1200);
      }

      if (price && price > 0) {
        await Coin.updateOne(
          { _id: coin._id },
          { $set: { price, updatedAt: new Date() } }
        );
        await CoinPriceCache.updateOne(
          { coinId: coin._id },
          { $set: { price, updatedAt: new Date() } },
          { upsert: true }
        );

        console.log(`✅ Updated ${coin.name} (${coin.symbol}) - $${price}`);
      } else {
        console.log(`⚠️ No price for ${coin.symbol}, skipping`);
      }
    } catch (error) {
      console.error(`❌ Error updating price for ${coin.symbol}:`, error.message);
    }
  }
}

module.exports = { updateCoinPrices };
