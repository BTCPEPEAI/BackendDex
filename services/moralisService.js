const axios = require('axios');

const base = 'https://deep-index.moralis.io/api/v2.2';

const headers = {
  'X-API-Key': process.env.MORALIS_API_KEY
};

exports.getWalletTokens = async (address, chain) => {
  const res = await axios.get(`${base}/${address}/erc20`, {
    params: { chain },
    headers
  });
  return res.data;
};

exports.getWalletTxns = async (address, chain) => {
  const res = await axios.get(`${base}/${address}`, {
    params: { chain },
    headers
  });
  return res.data.result || [];
};
