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
    startPriceUpdater();         // ✅ Price from DEX pools
    startTradeListener();        // ✅ Trade pairs
    startLivePriceWatcher();     // ✅ Real-time liquidity price
    startCoinFetcher();          // ✅ New coin discovery
    updateCategories();          // ✅ Gainers, Trending, etc.
    startCandleUpdater();        // ✅ 1min / 5min OHLC data
    cleanDatabase();             // ✅ Remove LP/UNK coins

    console.log('✅ Background jobs started successfully');
  } catch (err) {
    console.error('❌ Error starting background jobs:', err);
  }
}

module.exports = { startJobs };
