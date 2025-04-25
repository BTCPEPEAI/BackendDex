const { ethers } = require('ethers');

const BSC_RPC = process.env.BSC_RPC || 'https://bsc-dataseed.binance.org/';
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC); // ✅ FIXED LINE

module.exports = provider;
