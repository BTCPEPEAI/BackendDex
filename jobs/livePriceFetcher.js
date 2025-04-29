// jobs/livePriceFetcher.js
const { watchPairs } = require('../services/livePairWatcher');

function startLivePriceWatcher() {
  console.log('🧠 Live Price Watcher started...');
  watchPairs(); // This reads price directly from pools
}

module.exports = { startLivePriceWatcher };
