// jobs/priceUpdater.js

const { ethers } = require('ethers');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI } = require('../abis');

// Hardcoded config (no ENV needed)
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
    base: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
  }
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

      const config = NETWORKS[network];
      if (!config) {
        console.warn(`⚠️ Unknown network: ${network}`);
        continue;
      }

      const provider = new ethers.providers.JsonRpcProvider(config.rpc);
      const factory = new ethers.Contract(config.factory, FactoryABI, provider);
      const baseToken = config.base;

      if (contractAddress.toLowerCase() === baseToken.toLowerCase()) {
        console.warn(`⚠️ Skipping base token: ${coin.symbol}`);
        continue;
      }

      const pairAddress = await getPairAddress(factory, contractAddress, baseToken);
      if (!pairAddress) {
        console.warn(`⚠️ No DEX pair found for ${coin.symbol} (${contractAddress})`);
        continue;
      }

      try {
        const pair = new ethers.Contract(pairAddress, PairABI, provider);
        const price = await getPriceFromPair(pair, contractAddress);

        if (price > 0 && price < 1000000) {
          await Coin.updateOne(
            { _id: coin._id },
            { $set: { price: parseFloat(price), updatedAt: new Date() } }
          );

          console.log(`✅ Price updated: ${coin.symbol} → $${price.toFixed(6)}`);
        } else {
          console.warn(`⚠️ Invalid price for ${coin.symbol}`);
        }
      } catch (err) {
        console.warn(`⚠️ Failed to read reserves for pair: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('❌ Error in price updater:', err.message);
  }
}

function startPriceUpdater() {
  console.log('⏱️ Price updater started (on-chain)...');
  updatePrices();
  setInterval(updatePrices, 5000); // every 5 seconds
}

module.exports = { startPriceUpdater };
