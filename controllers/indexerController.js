const { fetchCoinData } = require('../services/indexerService');

exports.getCoinInfo = async (req, res) => {
  const { address, network, symbol } = req.query;

  try {
    const coin = await fetchCoinData(address, network, symbol);
    res.json({ coin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
