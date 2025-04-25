const { getDexData } = require('../services/dexDataService');

exports.fetchDexData = async (req, res) => {
  const { contract } = req.params;
  const { network } = req.query;

  if (!contract || !network) return res.status(400).json({ error: 'Missing data' });

  try {
    const dexInfo = await getDexData(contract, network);
    res.json(dexInfo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch DEX data', details: err.message });
  }
};
