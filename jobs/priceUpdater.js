const { ethers } = require('ethers');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI } = require('../abis');

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
  bsc: process.env.BSC_BASE_TOKEN,
  eth: process.env.ETH_BASE_TOKEN,
  polygon: process.env.POLYGON_BASE_TOKEN,
};

async function getPair(factory, tokenA, tokenB) {
  try {
    const pairAddress = await factory.getPair(tokenA, tokenB);
    if (pairAddress === ethers.constants.AddressZero) return null;
    return pairAddress;
  } catch (err) {
    console.error(`❌ getPair failed:`, err.message);
    return null;
  }
}

async function getPriceFromPair(pairContract, tokenAddress) {
  try {
    const [reserve0, reserve1] = await pairContract.getReserves();
    const token0 = await pairContract.token0();
    const token1 = await pairContract.token1();

    if (tokenAddress.toLowerCase() === token0.toLowerCase()) {
      return Number(reserve1) / Number(reserve0);
    } else {
      return Number(reserve0) / Number(reserve1);
    }
  } catch (err) {
    console.warn(`⚠️ Failed to read reserves for pair:`, err.message);
    return 0;
  }
}

async function updatePrices() {
  const coins = await Coin.find({});

  for (const coin of coins) {
    const { contractAddress, network, symbol } = coin;
    const provider = providers[network];
    const factoryAddress = FACTORIES[network];
    const baseToken = BASES[network];

    if (!provider || !factoryAddress || !baseToken) {
      console.warn(`⚠️ Missing provider or config for ${network}`);
      continue;
    }

    // Don't price base tokens against themselves
    if (contractAddress.toLowerCase() === baseToken.toLowerCase()) {
      console.warn(`⚠️ Skipping base token: ${symbol}`);
      continue;
    }

    const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);
    const pairAddress = await getPair(factory, contractAddress, baseToken);
    if (!pairAddress) {
      console.warn(`⚠️ No DEX pair found for ${symbol} (${contractAddress})`);
      continue;
    }

    const pair = new ethers.Contract(pairAddress, PairABI, provider);
    const price = await getPriceFromPair(pair, contractAddress);

    if (price > 0) {
      await Coin.updateOne(
        { _id: coin._id },
        { $set: { price, updatedAt: new Date() } }
      );
      console.log(`✅ Price updated: ${symbol} → $${price.toFixed(6)}`);
    } else {
      console.warn(`⚠️ Invalid price for ${symbol}`);
    }
  }
}

function startPriceUpdater() {
  console.log('⏱️ Price updater started (on-chain)...');
  updatePrices();
  setInterval(updatePrices, 8000); // every 8 seconds
}

module.exports = { startPriceUpdater };
