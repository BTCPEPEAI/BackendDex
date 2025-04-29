// jobs/priceUpdater.js

const { ethers } = require('ethers');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI } = require('../abis');
const { getPriceFromPair } = require('../services/livePriceReader');

const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

const FACTORIES = {
  bsc: process.env.BSC_FACTORY_ADDRESS,
  eth: process.env.ETH_FACTORY_ADDRESS,
  polygon: process.env.POLYGON_FACTORY_ADDRESS,
};

const BASES = {
  bsc: process.env.BSC_BASE_TOKEN,      // WBNB
  eth: process.env.ETH_BASE_TOKEN,      // WETH
  polygon: process.env.POLYGON_BASE_TOKEN, // WMATIC
};

async function updatePrices() {
  try {
    const coins = await Coin.find({});

    for (const coin of coins) {
      const { contractAddress, network, symbol } = coin;

      const provider = providers[network];
      const factoryAddress = FACTORIES[network];
      const baseToken = BASES[network];

      if (!provider || !factoryAddress || !baseToken) {
        console.warn(`⚠️ Missing provider or factory/base for ${network}`);
        continue;
      }

      try {
        const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);
        const pairAddress = await factory.getPair(contractAddress, baseToken);

        if (!pairAddress || pairAddress === ethers.constants.AddressZero) {
          console.warn(`⚠️ No DEX pair found for ${symbol} (${contractAddress})`);
          continue;
        }

        const pair = new ethers.Contract(pairAddress, PairABI, provider);
        const price = await getPriceFromPair(pair, contractAddress);

        if (!price || isNaN(price) || price <= 0) {
          console.warn(`⚠️ Invalid price for ${symbol}`);
          continue;
        }

        await Coin.updateOne(
          { _id: coin._id },
          {
            $set: {
              price: parseFloat(price.toFixed(8)),
              updatedAt: new Date()
            }
          }
        );

        console.log(`✅ ${symbol} updated → $${price.toFixed(6)}`);
      } catch (err) {
        console.warn(`❌ Price update failed for ${symbol}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('❌ Error in price updater:', err.message);
  }
}

function startPriceUpdater() {
  console.log('⏱️ Price updater started (on-chain)...');
  updatePrices();
  setInterval(updatePrices, 5000); // Every 5 seconds
}

module.exports = { startPriceUpdater };
