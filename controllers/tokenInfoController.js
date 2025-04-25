const { getTokenInfoFromDexScreener } = require('../services/dexScreenerService');

exports.fetchTokenInfo = async (req, res) => {
  const { contract } = req.params;

  try {
    const tokenData = await getTokenInfoFromDexScreener(contract);
    res.json(tokenData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
