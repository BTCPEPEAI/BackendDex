const axios = require('axios');

const MORALIS_KEY = process.env.MORALIS_API_KEY;
const CG_BASE = 'https://api.coingecko.com/api/v3';
const MORALIS_BASE = 'https://deep-index.moralis.io/api/v2.2';

const headers = {
  'X-API-Key': MORALIS_KEY
};

exports.getCoinData = async (contract, chain) => {
  const tokenRes = await axios.get(`${MORALIS_BASE}/erc20/metadata`, {
    params: { chain, addresses: contract },
    headers
  });

  const priceRes = await axios.get(`${MORALIS_BASE}/erc20/${contract}/price`, {
    params: { chain },
    headers
  });

  return {
    tokenInfo: tokenRes.data[0],
    priceInfo: priceRes.data
  };
};
