// services/livePriceFetcher.js

const { ethers } = require('ethers');
const { PairABI } = require('../abis');
const Coin = require('../models/Coin');

// Setup WebSocket provider for BSC (can add more later)
const providerBSC = new ethers.providers.WebSocketProvider(process.env.BSC_WSS);

// Utility to fetch reserves from pair contract
async function getReserves(pairAddress) {
  const pair = new ethers.Contract(pairAddress, PairABI, providerBSC);
  const reserves = await pair.getReserves();
  const token0 = await pair.token0();
  const token1 = await pair.token1();

  return {
    reserve0: parseFloat(ethers.utils.formatUnits(reserves[0], 18)),
    reserve1: parseFloat(ethers.utils.formatUnits(reserves[1], 18)),
    token0,
    token1
  };
}

// Calculate price using reserves
async function getLivePrice(coin) {
  try {
    if (!coin.pairAddress) {
      console.warn(`⚠️ No pair address for ${coin.symbol}`);
      return null;
    }

    const { reserve0, reserve1, token0, token1 } = await getReserves(coin.pairAddress);

    if (coin.contractAddress.toLowerCase() === token0.toLowerCase()) {
      // Price = reserve1 / reserve0
      return reserve1 / reserve0;
    } else if (coin.contractAddress.toLowerCase() === token1.toLowerCase()) {
      // Price = reserve0 / reserve1
      return reserve0 / reserve1;
    } else {
      console.warn(`⚠️ Token mismatch for ${coin.symbol}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching price for ${coin.symbol}: ${error.message}`);
    return null;
  }
}

// Live price updater (every few seconds)
async function startLivePriceUpdater() {
  console.log('⏱️ Live price updater started...');

  async function updatePrices() {
    try {
      const coins = await Coin.find({ network: 'bsc', pairAddress: { $exists: true } });

      for (const coin of coins) {
        const price = await getLivePrice(coin);

        if (price && !isNaN(price) && price > 0) {
          coin.price = price;
          coin.updatedAt = new Date();
          await coin.save();
          console.log(`✅ [LIVE] Price updated: ${coin.symbol} → $${price.toFixed(8)}`);
        }
      }
    } catch (error) {
      console.error('❌ Error updating live prices:', error.message);
    }
  }

  updatePrices();
  setInterval(updatePrices, 15000); // Every 15 seconds
}

module.exports = { startLivePriceUpdater };
