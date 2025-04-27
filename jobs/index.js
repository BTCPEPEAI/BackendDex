const { startPriceUpdater } = require('./priceUpdater');
const { startTradeListener } = require('./tradeListener');
const { updateCandles } = require('./candleUpdater');
const { startCoinFetcher } = require('./coinFetcher');
const { updateCategories } = require('./categoryUpdater');

async function startJobs() {
  try {
    console.log('🚀 Starting background jobs...');

    startPriceUpdater();
    startTradeListener();
    startCoinFetcher();
    updateCandles(); // immediate run once
    updateCategories(); // immediate run once

    // Schedule updates
    setInterval(() => {
      updateCandles();
    }, 60 * 1000); // every 1 minute

    setInterval(() => {
      updateCategories();
    }, 2 * 60 * 1000); // every 2 minutes

    console.log('✅ Background jobs started successfully');
  } catch (error) {
    console.error('❌ Error starting background jobs:', error.message);
    throw error;
  }
}

module.exports = { startJobs };
