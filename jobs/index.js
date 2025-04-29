const { startLivePriceUpdater } = require('../services/livePriceFetcher'); // <== NEW import


function startJobs() {
  console.log('🚀 Starting background jobs...');

  try {
    startPriceUpdater();     // (Old normal price fallback)
    startTradeListener();    // Listening trades
    startCoinFetcher();      // Fetch new coins
    startCoinIndexer();      // Index tokens
    updateCandles();         // Candlestick chart updates
    updateCategories();      // Update Trending, Gainers, etc.

    // 🔥 NEW — Start the LIVE price updater!
    startLivePriceUpdater();  // <== ADD THIS

    // Schedule periodic updates
    setInterval(updateCandles, 60 * 1000);         // every 1 min
    setInterval(updateCategories, 2 * 60 * 1000);  // every 2 min

    console.log('✅ Background jobs started successfully');
  } catch (error) {
    console.error('❌ Error starting background jobs:', error.message);
  }
}


module.exports = { startJobs };
