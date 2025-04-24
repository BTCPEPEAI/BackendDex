const axios = require('axios');

const EXPLORERS = {
  ethereum: {
    url: 'https://api.etherscan.io/api',
    key: process.env.ETHERSCAN_API_KEY
  },
  bsc: {
    url: 'https://api.bscscan.com/api',
    key: process.env.BSCSCAN_API_KEY
  },
  polygon: {
    url: 'https://api.polygonscan.com/api',
    key: process.env.POLYGONSCAN_API_KEY
  }
};

exports.getTokenStats = async (contract, network = 'ethereum') => {
  const explorer = EXPLORERS[network];
  if (!explorer) throw new Error('Unsupported network');

  const [holdersRes, txnsRes] = await Promise.all([
    axios.get(`${explorer.url}?module=token&action=tokenholdercount&contractaddress=${contract}&apikey=${explorer.key}`),
    axios.get(`${explorer.url}?module=account&action=tokentx&contractaddress=${contract}&page=1&offset=10&sort=desc&apikey=${explorer.key}`)
  ]);

  return {
    holders: holdersRes.data.result || 0,
    recentTxns: (txnsRes.data.result || []).map(tx => ({
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timeStamp: tx.timeStamp
    }))
  };
};
