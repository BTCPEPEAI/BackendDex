// services/livePriceReader.js

const { ethers } = require('ethers');

// Minimal ABI to fetch reserves and token addresses
const PAIR_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function token1() view returns (address)'
];

/**
 * Get price of a token from a liquidity pair
 * @param {Object} provider - ethers.js provider
 * @param {string} pairAddress - Address of the LP token
 * @param {string} tokenAddress - Address of the token to price
 * @returns {number|null} - Price or null if error
 */
async function getPriceFromPair(provider, pairAddress, tokenAddress) {
  try {
    const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);

    const [reserve0, reserve1] = await pair.getReserves();
    const token0 = await pair.token0();
    const token1 = await pair.token1();

    if (!reserve0 || !reserve1) {
      console.warn(`⚠️ Invalid reserves for pair ${pairAddress}`);
      return null;
    }

    const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
    const price = isToken0
      ? Number(reserve1) / Number(reserve0)
      : Number(reserve0) / Number(reserve1);

    if (!price || price <= 0 || isNaN(price)) return null;
    return price;
  } catch (err) {
    console.error(`❌ Error reading price from ${pairAddress}: ${err.message}`);
    return null;
  }
}

module.exports = { getPriceFromPair };
