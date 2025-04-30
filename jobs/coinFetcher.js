// jobs/coinFetcher.js

const { ethers } = require('ethers');
const { enrichNewCoin } = require('../services/enrichNewCoin');
const Coin = require('../models/Coin');

// DEX Configs (hardcoded)
const DEX_CONFIG = {
  bsc: {
    rpc: 'https://bsc-dataseed.binance.org/',
    factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73', // PancakeSwap V2
    name: 'BSC'
  },
  eth: {
    rpc: 'https://eth.llamarpc.com',
    factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Uniswap V2
    name: 'ETH'
  },
  polygon: {
    rpc: 'https://polygon-rpc.com',
    factory: '0x5757371414417b8c6caad45baef941abc7d3ab32', // QuickSwap
    name: 'Polygon'
  }
};

// Factory ABI
const FactoryABI = [
  'event PairCreated(address indexed token0, address indexed token1, address pair, uint)',
];

// 🧠 Start live listeners on all networks
async function startCoinFetcher() {
  console.log('🚀 Coin fetcher started...');

  for (const [key, config] of Object.entries(DEX_CONFIG)) {
    const provider = new ethers.providers.JsonRpcProvider(config.rpc);
    const factory = new ethers.Contract(config.factory, FactoryABI, provider);

    try {
      const filter = factory.filters.PairCreated();

      provider.on(filter, async (token0, token1, pairAddress) => {
        try {
          if (!token0 || !token1 || !pairAddress) {
            console.warn(`⚠️ Invalid pair data:`, { token0, token1, pairAddress });
            return;
          }

          console.log(`🆕 [${key.toUpperCase()}] New pair: ${pairAddress}`);

          // Enrich both tokens
          for (const token of [token0.toLowerCase(), token1.toLowerCase()]) {
            const exists = await Coin.findOne({ contractAddress: token });
            if (!exists) {
              console.log(`🔍 Enriching: ${token}`);
              await enrichNewCoin(token, key);
            }
          }
        } catch (err) {
          console.error(`❌ Error in pair event:`, err.message);
        }
      });
    } catch (err) {
      console.error(`❌ Failed to set up listener for ${key.toUpperCase()}:`, err.message);
    }
  }
}

module.exports = { startCoinFetcher };


