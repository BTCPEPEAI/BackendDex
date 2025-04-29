// jobs/livePriceFetcher.js

const { ethers } = require('ethers');
const { FactoryABI } = require('../abis');
const { updateTokenPairPrices } = require('../services/livePriceReader');

const networks = {
  bsc: {
    rpc: process.env.BSC_RPC,
    factory: process.env.BSC_FACTORY_ADDRESS,
  },
  eth: {
    rpc: process.env.ETH_RPC,
    factory: process.env.ETH_FACTORY_ADDRESS,
  },
  polygon: {
    rpc: process.env.POLYGON_RPC,
    factory: process.env.POLYGON_FACTORY_ADDRESS,
  },
};

function startLivePriceWatcher() {
  console.log('🧠 Live Price Watcher started...');

  for (const [chain, config] of Object.entries(networks)) {
    if (!config.rpc || !config.factory) {
      console.warn(`⚠️ Missing config for ${chain}`);
      continue;
    }

    const provider = new ethers.providers.JsonRpcProvider(config.rpc);
    const factory = new ethers.Contract(config.factory, FactoryABI, provider);

    try {
      const filter = factory.filters.PairCreated();
      provider.on(filter, async (token0, token1, pairAddress, event) => {
        console.log(`🆕 New Pair Created: ${pairAddress} (${token0}/${token1})`);

        try {
          await updateTokenPairPrices(provider, pairAddress, chain);
        } catch (err) {
          console.error(`❌ Error updating token pair: ${err.message}`);
        }
      });
    } catch (err) {
      console.error(`❌ Failed to start listener for ${chain}: ${err.message}`);
    }
  }
}

module.exports = { startLivePriceWatcher };
