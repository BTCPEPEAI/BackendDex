const { startPriceUpdater } = require('./priceUpdater');
const { startTradeListener } = require('./tradeListener');
const { startLivePriceWatcher } = require('./livePriceFetcher'); // Ensure this file exists before running
const { startCoinFetcher } = require('./coinFetcher');
const { updateCategories } = require('./categoryUpdater');
const { startCandleUpdater } = require('./candleUpdater');
const { cleanDatabase } = require('./cleaner');

function startJobs() {
  console.log('🚀 Starting background jobs...');

  const jobs = [
    { name: 'Price Updater', action: startPriceUpdater },
    { name: 'Trade Listener', action: startTradeListener },
    { name: 'Live Price Watcher', action: startLivePriceWatcher },
    { name: 'Coin Fetcher', action: startCoinFetcher },
    { name: 'Category Updater', action: updateCategories },
    { name: 'Candle Updater', action: startCandleUpdater },
    { name: 'Database Cleaner', action: cleanDatabase },
  ];

  for (const job of jobs) {
    try {
      console.log(`➡️ Starting job: ${job.name}...`);
      job.action();
      console.log(`✅ Job "${job.name}" started successfully`);
    } catch (err) {
      console.error(`❌ Error starting job "${job.name}":`, err.message || err);
    }
  }

  console.log('✅ All background jobs initialization completed');
}

module.exports = { startJobs };
