const mongoose = require('mongoose');
const Trade = require('../models/Trade');
const Candle = require('../models/Candle');

async function generateCandles() {
  try {
    console.log('🕯️ Generating OHLC candles...');

    const now = new Date();
    const interval = 60 * 1000; // 1-minute candles
    const cutoff = new Date(now.getTime() - interval);

    const trades = await Trade.aggregate([
      { $match: { timestamp: { $gte: cutoff } } },
      {
        $group: {
          _id: {
            pair: '$pairAddress',
            interval: {
              $toDate: {
                $subtract: [{ $toLong: '$timestamp' }, { $mod: [{ $toLong: '$timestamp' }, interval] }]
              }
            }
          },
          open: { $first: '$price' },
          close: { $last: '$price' },
          high: { $max: '$price' },
          low: { $min: '$price' },
          volume: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    for (const candle of trades) {
      const { pair, interval } = candle._id;
      const { open, close, high, low, volume, count } = candle;

      await Candle.updateOne(
        { pairAddress: pair, interval, timeframe: '1m' },
        { $set: { open, close, high, low, volume, count, updatedAt: new Date() } },
        { upsert: true }
      );
    }

    console.log(`✅ Candle generation complete: ${trades.length} candles`);
  } catch (error) {
    console.error('❌ Error generating candles:', error.message);
  }
}

// Run every minute
function startCandleGenerator() {
  console.log('📊 Candle updater started...');
  generateCandles();
  setInterval(generateCandles, 60 * 1000);
}

module.exports = { startCandleGenerator };
