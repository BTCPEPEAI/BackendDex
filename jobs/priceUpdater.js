const Coin = require('../models/Coin');
const { fetchPriceFromSources } = require('../services/priceFetcher');

// Utility function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function startPriceUpdater() {
  console.log('⏱️ Price updater started...');

  while (true) {
    try {
      const coins = await Coin.find({});

      for (const coin of coins) {
        const price = await fetchPriceFromSources(coin.contractAddress, coin.network);

        if (price && price > 0) {
          coin.price = price;
          await coin.save();
          console.log(`✅ Price updated for ${coin.symbol}: $${price}`);
        } else {
          console.log(`⚠️ Failed to update price for ${coin.symbol}`);
        }

        await sleep(300); // small delay between each coin
      }
    } catch (error) {
      console.error('❌ Error updating prices:', error.message);
    }

    await sleep(5000); // Wait 5s then update again
  }
}

module.exports = { startPriceUpdater };
