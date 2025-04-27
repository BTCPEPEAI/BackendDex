const Coin = require('../models/Coin');
const CoinPriceCache = require('../models/CoinPriceCache');
const axios = require('axios');

// Utility to add a delay between API calls
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Fetch price from Dexscreener API
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

// Fetch price from Coingecko API
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

// Function to update prices for all coins
async function updateCoinPrices() {
  console.log('⏱️ Price updater started...');

  try {
    // Fetch active coins with prices greater than 0
    const coins = await Coin.find({ price: { $gt: 0 } }).limit(5000); // Avoid processing too many coins

    for (const coin of coins) {
      try {
        let price = null;

        // Fetch price from Dexscreener if contract address exists
        if (coin.contractAddress) {
          price = await fetchPriceFromDexscreener(coin.contractAddress);
          await delay(1200); // Avoid rate-limiting
        }

        // Fallback to Coingecko if no price from Dexscreener
        if (!price && coin.symbol) {
          price = await fetchPriceFromCoingecko(coin.symbol.toLowerCase());
          await delay(1200); // Avoid rate-limiting
        }

        // Update database if a valid price is found
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
      } catch (innerError) {
        console.error(`❌ Error updating price for ${coin.symbol}:`, innerError.message);
      }
    }

    console.log('✅ Price updater finished successfully');
  } catch (error) {
    console.error('❌ Error running price updater:', error.message);
  }
}

// Export the function to be used in the jobs index
function startPriceUpdater() {
  updateCoinPrices();
}

module.exports = { startPriceUpdater };
