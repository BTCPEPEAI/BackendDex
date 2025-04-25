const HomeBox = require('../models/HomeBox');
const { fetchFromCoinGecko } = require('../services/externalApiService');
const { fetchFromPumpFun } = require('../services/pumpfunService');

// ✅ Get coins from a specific box
const getHomepageBox = async (req, res) => {
  const { type } = req.params;

  try {
    const box = await HomeBox.findOne({ type });
    if (!box) return res.status(404).json({ error: 'Box not found' });

    const coins = await Promise.all(
      box.coins.map(async (contract) => {
        const data = await fetchFromCoinGecko(contract, box.network);
        return data;
      })
    );

    res.json({ type, coins });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load box' });
  }
};

// ✅ Admin can update a box
const updateHomepageBox = async (req, res) => {
  const { type, coins, network = 'ethereum' } = req.body;

  try {
    const updated = await HomeBox.findOneAndUpdate(
      { type },
      { coins, network, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Box updated', box: updated });
  } catch (e) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// ✅ Live Pump.fun data
const getPumpFunData = async (req, res) => {
  try {
    const data = await fetchFromPumpFun();
    res.json({ coins: data });
  } catch (e) {
    res.status(500).json({ error: 'Pump.fun fetch failed' });
  }
};

// ✅ Export them all together
module.exports = {
  getHomepageBox,
  updateHomepageBox,
  getPumpFunData
};
