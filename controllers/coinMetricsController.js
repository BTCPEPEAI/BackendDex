const { getCoinMetrics } = require('../services/coinGeckoService');

exports.fetchCoinMetrics = async (req, res) => {
  const { contract } = req.params;
  const { platform = 'ethereum' } = req.query;

  try {
    const data = await getCoinMetrics(contract, platform);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
