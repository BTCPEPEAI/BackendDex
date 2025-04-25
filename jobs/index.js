const { generateCandles } = require('./candleGenerator');

// Run every 1 minute
setInterval(generateCandles, 60 * 1000);
console.log('⏱️ Candle generator running...');
