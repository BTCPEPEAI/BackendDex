const { ethers } = require('ethers');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI } = require('../abis');

// Setup providers
const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

// Factory addresses
const FACTORY_ADDRESSES = {
  bsc: process.env.BSC_FACTORY_ADDRESS,
  eth: process.env.ETH_FACTORY_ADDRESS,
  polygon: process.env.POLYGON_FACTORY_ADDRESS,
};

// Base tokens (WBNB, WETH, WMATIC)
const BASE_TOKENS = {
  bsc: process.env.BSC_BASE_TOKEN,
  eth: process.env.ETH_BASE_TOKEN,
  polygon: process.env.POLYGON_BASE_TOKEN,
};

async function updatePrices() {
  const coins = await Coin.find({});

  for (const coin of coins) {
    const { contractAddress, network, symbol } = coin;

    if (!contractAddress || !network || !providers[network]) {
      console.warn(`⚠️ Unknown network: ${network}`);
      continue;
    }

    const provider = providers[network];
    const factoryAddress = FACTORY_ADDRESSES[network];
    const baseToken = BASE_TOKENS[network];

    if (!factoryAddress || !baseToken) {
      console.warn(`⚠️ Missing config for ${network}`);
      continue;
    }

    if (contractAddress.toLowerCase() === baseToken.toLowerCase()) {
      console.warn(`⚠️ Skipping base token: ${symbol}`);
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

      const [reserve0, reserve1] = await pair.getReserves();
      const token0 = await pair.token0();

      const price = contractAddress.toLowerCase() === token0.toLowerCase()
        ? Number(reserve1) / Number(reserve0)
        : Number(reserve0) / Number(reserve1);

      if (!isNaN(price) && price > 0) {
        await Coin.updateOne(
          { _id: coin._id },
          { $set: { price: parseFloat(price), updatedAt: new Date() } }
        );
        console.log(`✅ Price updated: ${symbol} → $${price.toFixed(6)}`);
      } else {
        console.warn(`⚠️ Invalid price for ${symbol}`);
      }

    } catch (err) {
      console.warn(`⚠️ Failed to read reserves for pair: ${err.message}`);
    }
  }
}

function startPriceUpdater() {
  console.log('⏱️ Price updater started (on-chain)...');
  updatePrices();
  setInterval(updatePrices, 5000); // every 5s
}

module.exports = { startPriceUpdater };
