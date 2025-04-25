const axios = require('axios');

// Mock URLs - you’ll replace these with real APIs or proxies
const pumpFunBase = 'https://api.pump.fun';
const dextoolsBase = 'https://api.dextools.io';
const pancakeBase = 'https://api.pancakeswap.finance/api/v2';

// Main DEX fetch logic
exports.getDexData = async (contract, network) => {
  let data = {};

  if (network === 'solana') {
    const response = await axios.get(`${pumpFunBase}/v1/token/${contract}`);
    data = {
      source: 'pump.fun',
      liquidity: response.data?.liquidity,
      txns: response.data?.txCount,
      poolCreated: response.data?.createdAt
    };
  }

  if (network === 'bsc') {
    const response = await axios.get(`${pancakeBase}/tokens/${contract}`);
    data = {
      source: 'pancakeswap',
      liquidity: response.data?.liquidity,
      volume24h: response.data?.volume24h,
      txns: response.data?.txCount,
      poolCreated: response.data?.poolCreatedAt
    };
  }

  if (network === 'eth') {
    // Assume proxy setup for Dextools API
    const response = await axios.get(`${dextoolsBase}/token/${contract}`);
    data = {
      source: 'dextools',
      liquidity: response.data?.liquidity,
      txns: response.data?.txCount,
      poolCreated: response.data?.createdAt
    };
  }

  return data;
};
