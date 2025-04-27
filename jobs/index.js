const { startPriceUpdater } = require('./priceUpdater');
const { startTradeListener } = require('./tradeListener');
const { startCoinFetcher } = require('./coinFetcher');
const { startCandleUpdater } = require('./candleUpdater');  // new function name
const { updateCategories } = require('./categoryUpdater');

async function startJobs() {
  try {
    console.log('🚀 Starting background jobs...');

    startPriceUpdater();
    startTradeListener();
    startCoinFetcher();
    startCandleUpdater(); // (Instead of manual updateCandles)
    updateCategories();

  } catch (error) {
    console.error('❌ Error starting background jobs:', error.message);
    throw error;
  }
}

module.exports = { startJobs };
