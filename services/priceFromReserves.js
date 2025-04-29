// services/priceFromReserves.js

const { ethers } = require('ethers');
const { PairABI } = require('../abis');

// Setup Provider
const provider = new ethers.providers.WebSocketProvider(process.env.BSC_WSS);

// Hardcoded WBNB Price temporarily
// Later we will fetch BNB price live too
const BNB_PRICE_USD = 600; // Example, update manually if needed

/**
 * Calculate live token price from pair reserves
 * @param {string} pairAddress - Address of the pair (from PancakeSwap)
 * @returns {number|null} - Token price in USD
 */
async function getLivePriceFromPair(pairAddress) {
  try {
    const pair = new ethers.Contract(pairAddress, PairABI, provider);

    const [reserves, token0, token1] = await Promise.all([
      pair.getReserves(),
      pair.token0(),
      pair.token1(),
    ]);

    const reserve0 = parseFloat(ethers.utils.formatUnits(reserves._reserve0, 18));
    const reserve1 = parseFloat(ethers.utils.formatUnits(reserves._reserve1, 18));

    // Check if WBNB is token0 or token1
    const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // Real WBNB

    if (token0.toLowerCase() === WBNB_ADDRESS.toLowerCase()) {
      // token0 is WBNB
      const tokenPrice = (reserve0 * BNB_PRICE_USD) / reserve1;
      return tokenPrice;
    } else if (token1.toLowerCase() === WBNB_ADDRESS.toLowerCase()) {
      // token1 is WBNB
      const tokenPrice = (reserve1 * BNB_PRICE_USD) / reserve0;
      return tokenPrice;
    } else {
      console.warn(`⚠️ Neither token is WBNB for pair ${pairAddress}`);
      return null;
    }

  } catch (error) {
    console.error(`❌ Error fetching reserves for ${pairAddress}: ${error.message}`);
    return null;
  }
}

module.exports = { getLivePriceFromPair };
