const Candle = require('../models/Candle');

// ✅ GET /api/candles/:address
const getCandles = async (req, res) => {
  const { address } = req.params;

  try {
    const candles = await Candle.find({ address }).sort({ timestamp: 1 }).limit(500);
    res.json(candles);
  } catch (err) {
    console.error('Candle error:', err.message);
    res.status(500).json({ error: 'Failed to fetch candlesticks' });
  }
};

module.exports = {
  getCandles,
};
