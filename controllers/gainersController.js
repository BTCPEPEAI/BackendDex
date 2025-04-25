const Coin = require('../models/Coin');

// ✅ GET /api/gainers
const getTopGainers = async (req, res) => {
  try {
    const gainers = await Coin.find({})
      .sort({ change24h: -1 }) // Highest 24h % change
      .limit(20);

    res.json(gainers);
  } catch (error) {
    console.error('Error fetching gainers:', error.message);
    res.status(500).json({ error: 'Failed to fetch top gainers' });
  }
};

module.exports = {
  getTopGainers,
};
