// jobs/priceUpdater.js

const { ethers } = require('ethers');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI, ERC20_ABI } = require('../abis');

const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

// PancakeSwap / Uniswap / QuickSwap Factory addresses
const FACTORIES = {
  bsc: process.env.BSC_FACTORY_ADDRESS,
  eth: process.env.ETH_FACTORY_ADDRESS,
  polygon: process.env.POLYGON_FACTORY_ADDRESS,
};

// WETH, WBNB, WMATIC addresses (for base pairing)
const BASES = {
  bsc: process.env.BSC_BASE_TOKEN,
  eth: process.env.ETH_BASE_TOKEN,
  polygon: process.env.POLYGON_BASE_TOKEN,
};

async function getPairAddress(factory, tokenA, tokenB) {
  try {
    const pairAddress = await factory.getPair(tokenA, tokenB);
    if (pairAddress === ethers.constants.AddressZero) return null;
    return pairAddress;
  } catch {
    return null;
  }
}

async function getPriceFromPair(pair, tokenAddress) {
  const [reserve0, reserve1] = await pair.getReserves();
  const token0 = await pair.token0();

  if (tokenAddress.toLowerCase() === token0.toLowerCase()) {
    return Number(reserve1) / Number(reserve0);
  } else {
    return Number(reserve0) / Number(reserve1);
  }
}

async function updatePrices() {
  try {
    const coins = await Coin.find({});

    for (const coin of coins) {
      const { contractAddress, network } = coin;

      const provider = providers[network];
      if (!provider) continue;

      const factory = new ethers.Contract(FACTORIES[network], FactoryABI, provider);

      const baseToken = BASES[network];
      if (!baseToken) continue;

      const pairAddress = await getPairAddress(factory, contractAddress, baseToken);

      if (!pairAddress) {
        console.warn(`⚠️ No pair found for ${coin.symbol}`);
        continue;
      }

      const pair = new ethers.Contract(pairAddress, PairABI, provider);

      let price;
      try {
        price = await getPriceFromPair(pair, contractAddress);
      } catch (err) {
        console.warn(`⚠️ Error getting price for ${coin.symbol}`);
        continue;
      }

      if (price > 0) {
        await Coin.updateOne(
          { _id: coin._id },
          { $set: { price: parseFloat(price), updatedAt: new Date() } }
        );

        console.log(`✅ Price updated: ${coin.symbol} → $${parseFloat(price).toFixed(6)}`);
      }
    }
  } catch (err) {
    console.error('❌ Error in price updater:', err.message);
  }
}

function startPriceUpdater() {
  console.log('⏱️ Price updater started (on-chain)...');
  updatePrices();
  setInterval(updatePrices, 3000); // Update every 3 seconds
}

module.exports = { startPriceUpdater };
