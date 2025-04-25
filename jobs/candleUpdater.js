const Candle = require('../models/Candle');
const TokenPair = require('../models/TokenPair');

const roundToMinute = (d) => new Date(Math.floor(d.getTime() / 60000) * 60000);

const updateCandles = async () => {
  const pairs = await TokenPair.find();

  for (const p of pairs) {
    const now = new Date();
    const time = roundToMinute(now);

    const price = p.price || 0;
    const volume = p.volumeUSD || 0;

    await Candle.findOneAndUpdate(
      { pairAddress: p.pairAddress, interval: '1m', timestamp: time },
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

  console.log('🕒 Candlesticks updated');
};

module.exports = { updateCandles };
