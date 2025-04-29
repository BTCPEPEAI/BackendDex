// priceUpdater.js

const { ethers } = require("ethers");
const Coin = require("../models/Coin");
const { FactoryABI, PairABI } = require("../abis");

// Setup providers per chain
const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

// Factory contracts
const FACTORIES = {
  bsc: process.env.BSC_FACTORY_ADDRESS,
  eth: process.env.ETH_FACTORY_ADDRESS,
  polygon: process.env.POLYGON_FACTORY_ADDRESS,
};

// Base tokens like WBNB, WETH, WMATIC
const BASES = {
  bsc: process.env.BSC_BASE_TOKEN,
  eth: process.env.ETH_BASE_TOKEN,
  polygon: process.env.POLYGON_BASE_TOKEN,
};

async function getPairAddress(factory, tokenA, tokenB) {
  try {
    const pairAddress = await factory.getPair(tokenA, tokenB);
    return pairAddress !== ethers.constants.AddressZero ? pairAddress : null;
  } catch (err) {
    console.warn("⚠️ Error calling getPair:", err.message);
    return null;
  }
}

async function getPriceFromPair(pair, tokenAddress) {
  try {
    const [reserve0, reserve1] = await pair.getReserves();
    const token0 = await pair.token0();

    const price = tokenAddress.toLowerCase() === token0.toLowerCase()
      ? Number(reserve1) / Number(reserve0)
      : Number(reserve0) / Number(reserve1);

    return price;
  } catch (err) {
    console.warn("⚠️ Failed to read reserves for pair:", err.message);
    return null;
  }
}

async function updatePrices() {
  try {
    const coins = await Coin.find({});

    for (const coin of coins) {
      const { contractAddress, network, symbol } = coin;

      if (!providers[network] || !FACTORIES[network] || !BASES[network]) {
        console.warn(`⚠️ Missing provider or factory/base for ${network}`);
        continue;
      }

      const provider = providers[network];
      const factory = new ethers.Contract(FACTORIES[network], FactoryABI, provider);
      const baseToken = BASES[network];

      if (contractAddress.toLowerCase() === baseToken.toLowerCase()) {
        console.warn(`⚠️ Skipping base token: ${symbol}`);
        continue;
      }

      const pairAddress = await getPairAddress(factory, contractAddress, baseToken);

      if (!pairAddress) {
        console.warn(`⚠️ No DEX pair found for ${symbol} (${contractAddress})`);
        continue;
      }

      const pair = new ethers.Contract(pairAddress, PairABI, provider);
      const price = await getPriceFromPair(pair, contractAddress);

      if (price && price > 0) {
        await Coin.updateOne(
          { _id: coin._id },
          { $set: { price: parseFloat(price), updatedAt: new Date() } }
        );
        console.log(`✅ Price updated: ${symbol} → $${price.toFixed(6)}`);
      } else {
        console.warn(`⚠️ Invalid price for ${symbol}`);
      }
    }
  } catch (err) {
    console.error("❌ Error in price updater:", err.message);
  }
}

function startPriceUpdater() {
  console.log("⏱️ Price updater started (on-chain)...");
  updatePrices();
  setInterval(updatePrices, 10000); // every 10 seconds
}

module.exports = { startPriceUpdater };
