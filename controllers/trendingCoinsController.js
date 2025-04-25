const TrendingCoin = require('../models/TrendingCoin');

// GET: Fetch all trending coins (sorted)
exports.getTrendingCoins = async (req, res) => {
  try {
    const coins = await TrendingCoin.find().sort({ position: 1 });
    res.json(coins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending coins', error });
  }
};

// POST: Add new coin
exports.addTrendingCoin = async (req, res) => {
  try {
    const { coinId, name, symbol, price, change24h, position, boxType } = req.body;

    const existing = await TrendingCoin.findOne({ coinId, boxType });
    if (existing) return res.status(400).json({ message: 'Coin already exists in this box' });

    const newCoin = new TrendingCoin({ coinId, name, symbol, price, change24h, position, boxType });
    await newCoin.save();

    res.status(201).json(newCoin);
  } catch (error) {
    res.status(500).json({ message: 'Error adding coin', error });
  }
};

// PUT: Update position or move coin
exports.updateTrendingCoin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await TrendingCoin.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Coin not found' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coin', error });
  }
};

// DELETE: Remove a coin
exports.deleteTrendingCoin = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await TrendingCoin.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Coin not found' });

    res.json({ message: 'Coin removed from trending' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coin', error });
  }
};
