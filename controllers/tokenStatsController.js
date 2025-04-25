const { getTokenStats } = require('../services/explorerService');

exports.fetchTokenStats = async (req, res) => {
  const { contract } = req.params;
  const { network = 'ethereum' } = req.query;

  try {
    const data = await getTokenStats(contract, network);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
