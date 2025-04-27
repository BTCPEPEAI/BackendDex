// /jobs/index.js

function startJobs() {
  console.log('🚀 Starting background jobs...');

  // Background Jobs
  require('./priceUpdater').startPriceUpdater();
  require('./tradeListener').startTradeListener();
  require('./candleUpdater').updateCandles();
  require('./coinFetcher').startCoinFetcher();
  require('./coinIndexer').startCoinIndexer();
  require('./categoryUpdater').updateCategories();

  // Update candles every 1 minute
  setInterval(() => {
    require('./candleUpdater').updateCandles();
  }, 60 * 1000);

  // Update categories every 2 minutes
  setInterval(() => {
    require('./categoryUpdater').updateCategories();
  }, 2 * 60 * 1000);
}

module.exports = { startJobs };
