// jobs/priceUpdater.js

const { ethers } = require('ethers');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI } = require('../abis');

// ✅ Hardcoded RPC + Factory + Base token configs
const NETWORKS = {
  bsc: {
    rpc: 'https://bsc-dataseed.binance.org/',
    factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
    base: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
  },
  eth: {
    rpc: 'https://eth.llamarpc.com',
    factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    base: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  },
  polygon: {
    rpc: 'https://polygon-rpc.com',
    factory: '0x5757371414417b8c6caad45baef941abc7d3ab32',
    base: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH (bridged)
  }
};

// 🔁 Get pair address from factory
async function getPairAddress(factory, tokenA, tokenB) {
  try {
    const pair = await factory.getPair(tokenA, tokenB);
    return pair === ethers.constants.AddressZero ? null : pair;
  } catch (err) {
    console.warn(`⚠️ Error fetching pair for ${tokenA} & ${tokenB}: ${err.message}`);
    return null;
  }
}

// 📈 Compute price from reserve ratios
async function getPriceFromPair(pair, tokenAddress) {
  try {
    const [reserve0, reserve1] = await pair.getReserves();
    const token0 = await pair.token0();

    const r0 = ethers.BigNumber.from(reserve0);
    const r1 = ethers.BigNumber.from(reserve1);

    if (tokenAddress.toLowerCase() === token0.toLowerCase()) {
      return parseFloat(r1.toString()) / parseFloat(r0.toString());
    } else {
      return parseFloat(r0.toString()) / parseFloat(r1.toString());
    }
  } catch (err) {
    console.warn(`⚠️ Failed to get reserves: ${err.message}`);
    return null;
  }
}

// 🔄 Update all coin prices
async function updatePrices() {
  try {
    const coins = await Coin.find({});

    for (const coin of coins) {
      const { contractAddress, network, symbol } = coin;
      const config = NETWORKS[network];

      if (!config) {
        console.warn(`⚠️ Unsupported network for ${symbol}: ${network}`);
        continue;
      }

      const provider = new ethers.providers.JsonRpcProvider(config.rpc);
      const factory = new ethers.Contract(config.factory, FactoryABI, provider);
      const baseToken = config.base;

      if (!contractAddress || !baseToken) {
        console.warn(`⚠️ Missing address for ${symbol}`);
        continue;
      }

      if (contractAddress.toLowerCase() === baseToken.toLowerCase()) {
        console.warn(`⚠️ Skipping base token: ${symbol}`);
        continue;
      }

      const pairAddress = await getPairAddress(factory, contractAddress, baseToken);
      if (!pairAddress) {
        console.warn(`⚠️ No DEX pair found for ${symbol}`);
        continue;
      }

      const pair = new ethers.Contract(pairAddress, PairABI, provider);
      const price = await getPriceFromPair(pair, contractAddress);

      if (!price || price <= 0 || price >= 1_000_000) {
        console.warn(`⚠️ Invalid price for ${symbol}`);
        continue;
      }

      await Coin.updateOne(
        { _id: coin._id },
        { $set: { price: parseFloat(price.toFixed(10)), updatedAt: new Date() } }
      );

      console.log(`✅ Price updated: ${symbol} → $${price.toFixed(6)}`);
    }
  } catch (err) {
    console.error('❌ Error in price updater:', err.message);
  }
}

// ⏱️ Start price updater job
function startPriceUpdater() {
  console.log('⏱️ Price updater started (on-chain)...');
  updatePrices();
  setInterval(updatePrices, 5000); // Every 5 seconds
}

module.exports = { startPriceUpdater };
