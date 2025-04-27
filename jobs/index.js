const { startPriceUpdater } = require('./priceUpdater');
const { startTradeListener } = require('./tradeListener');
const { updateCandles } = require('./candleUpdater');
const { startCoinFetcher } = require('./coinFetcher');
const { startCoinIndexer } = require('./coinIndexer');
const { updateCategories } = require('./categoryUpdater');

function startJobs() {
  console.log('🚀 Starting background jobs...');

  try {
    // Start all background jobs
    startPriceUpdater();
    startTradeListener();
    updateCandles();
    startCoinFetcher();
    startCoinIndexer();
    updateCategories();

    // Schedule periodic jobs
    setInterval(() => {
      updateCandles();
    }, 60 * 1000); // Every 1 minute

    setInterval(() => {
      updateCategories();
    }, 2 * 60 * 1000); // Every 2 minutes

    console.log('✅ Background jobs started successfully');
  } catch (error) {
    console.error('❌ Error starting background jobs:', error.message);
  }
}

module.exports = { startJobs };
