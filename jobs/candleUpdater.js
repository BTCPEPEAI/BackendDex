// jobs/candleUpdater.js

const Candle = require('../models/Candle');
const TokenPair = require('../models/TokenPair');

// ⏱ Round time to nearest 1 minute
const roundToMinute = (d) => new Date(Math.floor(d.getTime() / 60000) * 60000);

async function updateCandles() {
  try {
    const pairs = await TokenPair.find({});

    const now = new Date();
    const time = roundToMinute(now);

    for (const p of pairs) {
      const price = p.price || 0;
      const volume = p.volumeUSD || 0;

      if (!p.pairAddress || !price) continue;

      await Candle.findOneAndUpdate(
        { pairAddress: p.pairAddress, interval: '1m', timestamp: time },
        {
          $setOnInsert: {
            open: price,
            high: price,
            low: price
          },
          $max: { high: price },
          $min: { low: price },
          $set: { close: price },
          $inc: { volume }
        },
        { upsert: true, new: true }
      );
    }

    console.log(`🕒 Candlesticks updated at ${time.toISOString()}`);
  } catch (err) {
    console.error('❌ Error updating candles:', err.message);
  }
}

function startCandleUpdater() {
  console.log('📊 Candle updater started...');
  updateCandles(); // Run immediately
  setInterval(updateCandles, 60 * 1000); // Every 1 minute
}

module.exports = { startCandleUpdater };
