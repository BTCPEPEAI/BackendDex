const axios = require('axios');

exports.getHoldingsAndTxs = async (wallet, chain) => {
  try {
    if (chain === 'eth') {
      const apiKey = process.env.ETHERSCAN_KEY;
      const [balanceRes, txRes] = await Promise.all([
        axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${wallet}&tag=latest&apikey=${apiKey}`),
        axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${wallet}&sort=desc&apikey=${apiKey}`),
      ]);

      return {
        balance: balanceRes.data.result,
        transactions: txRes.data.result.slice(0, 10), // latest 10 txs
      };
    }

    // Add BSC, Solana, etc. here using their public APIs
    return { balance: 0, transactions: [] };
  } catch (err) {
    return { error: 'Error fetching wallet info' };
  }
};
