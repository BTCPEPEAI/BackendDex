const { generateCandles } = require('./candleGenerator');

// Run every 1 minute
setInterval(generateCandles, 60 * 1000);
console.log('⏱️ Candle generator running...');

const { updateCategories } = require('./categoryUpdater');

setInterval(() => {
  updateCategories();
}, 5 * 60 * 1000); // every 5 minutes
