async function startJobs() {
  console.log('🚀 Starting background jobs...');

  try {
    // Start background jobs
    const priceUpdater = await import('./priceUpdater.js');
    priceUpdater.startPriceUpdater();

    const tradeListener = await import('./tradeListener.js');
    tradeListener.startTradeListener();

    const candleUpdater = await import('./candleUpdater.js');
    candleUpdater.updateCandles();

    const coinFetcher = await import('./coinFetcher.js');
    coinFetcher.startCoinFetcher();

    const coinIndexer = await import('./coinIndexer.js');
    coinIndexer.startCoinIndexer();

    const categoryUpdater = await import('./categoryUpdater.js');
    categoryUpdater.updateCategories();

    // Schedule periodic tasks
    setInterval(async () => {
      try {
        const candleUpdater = await import('./candleUpdater.js');
        candleUpdater.updateCandles();
      } catch (error) {
        console.error('❌ Error in candle update interval:', error.message);
      }
    }, 60 * 1000); // Every 1 minute

    setInterval(async () => {
      try {
        const categoryUpdater = await import('./categoryUpdater.js');
        categoryUpdater.updateCategories();
      } catch (error) {
        console.error('❌ Error in category update interval:', error.message);
      }
    }, 2 * 60 * 1000); // Every 2 minutes
  } catch (error) {
    console.error('❌ Failed to start background jobs:', error.message);
  }
}

module.exports = {
  startJobs,
};
