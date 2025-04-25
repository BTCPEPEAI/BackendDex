const { ethers } = require('ethers');

const BSC_RPC = process.env.BSC_RPC || 'https://bsc-dataseed.binance.org/';
const provider = new ethers.JsonRpcProvider(BSC_RPC);

module.exports = provider;
