// jobs/coinFetcher.js

const { ethers } = require('ethers');
const { FactoryABI } = require('../abis');
const Coin = require('../models/Coin');
const { enrichNewCoin } = require('../services/enrichNewCoin');

// Network providers
const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

// Factory contract addresses
const FACTORY_ADDRESSES = {
  bsc: process.env.BSC_FACTORY,
  eth: process.env.ETH_FACTORY,
  polygon: process.env.POLYGON_FACTORY,
};

async function startCoinFetcher() {
  console.log('🚀 Coin fetcher started...');

  for (const [network, provider] of Object.entries(providers)) {
    const factoryAddress = FACTORY_ADDRESSES[network];

    if (!factoryAddress) {
      console.warn(`⚠️ Missing factory address for ${network}, skipping...`);
      continue;
    }

    try {
      const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);
      const pairCreatedFilter = factory.filters.PairCreated();

      provider.on(pairCreatedFilter, async (token0, token1, pairAddress) => {
        try {
          console.log(`🆕 New pair detected on ${network}: ${pairAddress}`);
          const tokens = [token0.toLowerCase(), token1.toLowerCase()];

          for (const address of tokens) {
            const exists = await Coin.findOne({ contractAddress: address });

            if (exists) {
              console.log(`✅ Token already exists: ${address}`);
              continue;
            }

            console.log(`🔄 Enriching new token: ${address} on ${network}`);
            await enrichNewCoin(address, network);
          }
        } catch (err) {
          console.error(`❌ Error enriching pair on ${network}: ${err.message}`);
        }
      });

    } catch (err) {
      console.error(`❌ Failed to listen for pairs on ${network}: ${err.message}`);
    }
  }
}

module.exports = { startCoinFetcher };
