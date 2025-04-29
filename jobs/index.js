// jobs/index.js

const { startPriceUpdater } = require('./priceUpdater');
const { startTradeListener } = require('./tradeListener');
const { startLivePriceWatcher } = require('./livePriceFetcher');
const { startCoinFetcher } = require('./coinFetcher');
const { updateCategories } = require('./categoryUpdater');
const { startCandleUpdater } = require('./candleUpdater');
const { cleanDatabase } = require('./cleaner');

function startJobs() {
  console.log('🚀 Starting background jobs...');

  try {
    startPriceUpdater();         // ✅ On-chain price sync
    startTradeListener();        // ✅ Track new swaps/pairs
    startLivePriceWatcher();     // ✅ Realtime price listener
    startCoinFetcher();          // ✅ Auto-fetch new coins
    startCandleUpdater();        // ✅ Start candle loop
    updateCategories();          // ✅ Initial category update
    cleanDatabase();             // ✅ One-time clean on boot

    // Optional: schedule categories update every 2 min
    setInterval(updateCategories, 2 * 60 * 1000);

    console.log('✅ Background jobs started successfully');
  } catch (err) {
    console.error('❌ Error starting background jobs:', err.message);
  }
}

module.exports = { startJobs };
