// services/livePairWatcher.js
const Coin = require('../models/Coin');
const { ethers } = require('ethers');
const { PairABI } = require('../abis');
const { BSC_RPC } = process.env;

const provider = new ethers.providers.JsonRpcProvider(BSC_RPC);

// Helper: Calculate price from reserves
function getPriceFromReserves(reserve0, reserve1) {
  if (reserve0 === 0 || reserve1 === 0) return 0;
  return reserve1 / reserve0;
}

// Main listener function
async function watchPairs() {
  console.log('🔁 Listening to coin price via reserve updates...');

  const coins = await Coin.find({ dex: { $exists: true } });

  for (const coin of coins) {
    const { contractAddress, dex } = coin;
    if (!dex || !dex.pairAddress || !dex.token0 || !dex.token1) continue;

    try {
      const pair = new ethers.Contract(dex.pairAddress, PairABI, provider);

      pair.on('Sync', async (reserve0, reserve1) => {
        const price =
          dex.token0.toLowerCase() === contractAddress.toLowerCase()
            ? getPriceFromReserves(reserve0, reserve1)
            : getPriceFromReserves(reserve1, reserve0);

        if (!price || price === 0 || price === Infinity) return;

        await Coin.updateOne(
          { contractAddress },
          { $set: { price, updatedAt: new Date() } }
        );

        console.log(`💹 ${coin.symbol || 'UNKNOWN'} price updated → $${price.toFixed(6)}`);
      });
    } catch (err) {
      console.error(`❌ Failed to listen for ${coin.symbol}: ${err.message}`);
    }
  }
}

module.exports = { watchPairs };
