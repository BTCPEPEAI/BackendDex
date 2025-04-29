// jobs/coinFetcher.js

const { ethers } = require('ethers');
const { FactoryABI } = require('../abis');
const { enrichNewCoin } = require('../services/enrichNewCoin');
const Coin = require('../models/Coin');

const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

const FACTORY_ADDRESSES = {
  bsc: process.env.BSC_FACTORY,
  eth: process.env.ETH_FACTORY,
  polygon: process.env.POLYGON_FACTORY,
};

async function startCoinFetcher() {
  console.log('🚀 Coin fetcher started...');

  for (const [network, provider] of Object.entries(providers)) {
    const factoryAddress = FACTORY_ADDRESSES[network];

    if (!factoryAddress || factoryAddress.length < 10) {
      console.warn(`⚠️ Missing factory address for ${network}, skipping...`);
      continue;
    }

    try {
      const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);
      const filter = factory.filters.PairCreated();

      provider.on(filter, async (token0, token1, pairAddress, event) => {
        try {
          if (!token0 || !token1 || !pairAddress) {
            console.warn(`⚠️ Invalid pair on ${network}:`, { token0, token1, pairAddress });
            return;
          }

          console.log(`🆕 New Pair Created: ${pairAddress} (${token0}/${token1})`);

          const tokens = [token0.toLowerCase(), token1.toLowerCase()];
          for (const token of tokens) {
            const exists = await Coin.findOne({ contractAddress: token });
            if (!exists) {
              console.log(`🔍 Enriching token: ${token} on ${network}`);
              await enrichNewCoin(token, network);
            }
          }
        } catch (err) {
          console.error(`❌ Error handling pair for ${network}:`, err.message);
        }
      });

    } catch (err) {
      console.error(`❌ Error setting up fetcher for ${network}:`, err.message);
    }
  }
}

module.exports = { startCoinFetcher };
