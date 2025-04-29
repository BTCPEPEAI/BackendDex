// jobs/livePriceFetcher.js
const { watchPairs } = require('../services/livePairWatcher');

function startLivePriceWatcher() {
  console.log('🧠 Live Price Watcher started...');
  watchPairs(); // This reads price directly from pools
}

// inside listener for new pairs
await updateTokenPairPrices(provider, pairAddress);


module.exports = { startLivePriceWatcher };
