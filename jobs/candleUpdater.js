// jobs/candleUpdater.js

const Candle = require('../models/Candle');
const TokenPair = require('../models/TokenPair');

// Round timestamp to the nearest minute
const roundToMinute = (d) => new Date(Math.floor(d.getTime() / 60000) * 60000);

async function updateCandles() {
  const pairs = await TokenPair.find();

  const now = new Date();
  const timestamp = roundToMinute(now);

  for (const p of pairs) {
    if (!p.pairAddress || !p.price) continue;

    const price = Number(p.price) || 0;
    const volume = Number(p.volumeUSD) || 0;

    await Candle.findOneAndUpdate(
      { pairAddress: p.pairAddress, interval: '1m', timestamp },
      {
        $setOnInsert: {
          open: price,
          high: price,
          low: price,
        },
        $max: { high: price },
        $min: { low: price },
        $set: { close: price },
        $inc: { volume }
      },
      { upsert: true, new: true }
    );
  }

  console.log('🕒 Candlesticks updated at', timestamp.toISOString());
}

// Auto-start every 1 minute
function startCandleUpdater() {
  updateCandles();
  setInterval(updateCandles, 60 * 1000); // Every 1 minute
  console.log('📊 Candle updater started...');
}

module.exports = { startCandleUpdater };
