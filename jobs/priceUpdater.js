const Coin = require('../models/Coin');
const { fetchPriceFromCoinGecko } = require('../services/coinFetchService');

const updateCoinPrices = async () => {
  try {
    const coins = await Coin.find({});

    for (const coin of coins) {
      try {
        const priceData = await fetchPriceFromCoinGecko(coin.contractAddress, coin.network);

        if (priceData && priceData.price && priceData.price > 0) {
          const price = priceData.price;
          const volume = priceData.volume || 0;
          const priceChange24h = priceData.priceChange24h || 0;

          await Coin.updateOne(
            { _id: coin._id },
            { $set: { price, volume, priceChange24h } }
          );

          console.log(`✅ Updated: ${coin.symbol} Price: $${price}`);
        } else {
          console.log(`⚠️ No price for ${coin.symbol}, skipping`);
        }
      } catch (err) {
        console.error(`❌ Error updating price for ${coin.symbol}:`, err.message);
      }
    }

  } catch (error) {
    console.error('❌ updateCoinPrices Error:', error.message);
  }
};

const startPriceUpdater = () => {
  updateCoinPrices();
  setInterval(updateCoinPrices, 3000); // Every 3 seconds
};

module.exports = { startPriceUpdater };
