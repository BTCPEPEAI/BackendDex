// /jobs/index.js

async function startJobs() {
  console.log('Starting background jobs...');

  // Start background jobs here
  import('./priceUpdater.js').then(module => module.startPriceUpdater());
  import('./tradeListener.js').then(module => module.startTradeListener());
  import('./candleUpdater.js').then(module => module.updateCandles());
  import('./coinFetcher.js').then(module => module.startCoinFetcher());
  import('./coinIndexer.js').then(module => module.startCoinIndexer());
  import('./categoryUpdater.js').then(module => module.updateCategories());

  // Repeat candle update every minute
  setInterval(() => {
    import('./candleUpdater.js').then(module => module.updateCandles());
  }, 60 * 1000);

  // Repeat category updater every 2 minutes
  setInterval(() => {
    import('./categoryUpdater.js').then(module => module.updateCategories());
  }, 2 * 60 * 1000);
}

module.exports = {
  startJobs,
};
