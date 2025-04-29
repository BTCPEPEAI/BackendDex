// jobs/coinFetcher.js

const { ethers } = require('ethers');
const { FactoryABI } = require('../abis');
const { enrichNewCoin } = require('../services/enrichNewCoin');
const Coin = require('../models/Coin');

// Setup providers
const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

// Factory addresses
const FACTORY_ADDRESSES = {
  bsc: process.env.BSC_FACTORY,
  eth: process.env.ETH_FACTORY,
  polygon: process.env.POLYGON_FACTORY,
};

async function startCoinFetcher() {
  console.log('🚀 Coin fetcher started...');

  for (const [network, provider] of Object.entries(providers)) {
    const factoryAddress = FACTORY_ADDRESSES[network];
    const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);

    try {
      const pairCreatedFilter = factory.filters.PairCreated();
      provider.on(pairCreatedFilter, async (token0, token1, pairAddress, event) => {
        try {
          console.log(`🆕 New Pair Detected: ${pairAddress} on ${network}`);

          // Auto-enrich both tokens
          const tokens = [token0.toLowerCase(), token1.toLowerCase()];

          for (const tokenAddress of tokens) {
            const exists = await Coin.findOne({ contractAddress: tokenAddress });

            if (!exists) {
              console.log(`🔎 Enriching new token: ${tokenAddress}`);
              await enrichNewCoin(tokenAddress, network);
            }
          }
        } catch (err) {
          console.error(`❌ Error in pair detected event: ${err.message}`);
        }
      });

    } catch (error) {
      console.error(`❌ Error setting up coin fetcher for ${network}:`, error.message);
    }
  }
}

module.exports = { startCoinFetcher };
