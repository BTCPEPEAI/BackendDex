const Trade = require('../models/Trade');
const Candle = require('../models/Candle');

const INTERVAL = 60 * 1000; // 1 minute

const generateCandles = async () => {
  const now = new Date();
  const oneMinuteAgo = new Date(now - INTERVAL);

  const trades = await Trade.find({ timestamp: { $gte: oneMinuteAgo } });

  const grouped = {};

  for (const t of trades) {
    if (!grouped[t.pairAddress]) grouped[t.pairAddress] = [];
    grouped[t.pairAddress].push(t);
  }

  for (const [pair, txns] of Object.entries(grouped)) {
    const prices = txns.map(t => t.amountOut / t.amountIn);
    if (prices.length === 0) continue;

    const open = prices[0];
    const close = prices[prices.length - 1];
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const volume = txns.reduce((sum, t) => sum + t.amountIn, 0);

    await Candle.create({
      pairAddress: pair,
      interval: '1m',
      open,
      high,
      low,
      close,
      volume,
      timestamp: now
    });

    console.log(`🕯️ 1m Candle created for ${pair}`);
  }
};

module.exports = { generateCandles };
