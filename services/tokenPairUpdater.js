// services/tokenPairUpdater.js

const { ethers } = require('ethers');
const TokenPair = require('../models/TokenPair');
const { PairABI } = require('../abis');

// Helper to fetch decimals for tokens (we cache them)
const tokenDecimalsCache = {};
async function getDecimals(token, provider) {
  if (tokenDecimalsCache[token]) return tokenDecimalsCache[token];

  const ERC20_ABI = ['function decimals() view returns (uint8)'];
  try {
    const contract = new ethers.Contract(token, ERC20_ABI, provider);
    const decimals = await contract.decimals();
    tokenDecimalsCache[token] = decimals;
    return decimals;
  } catch {
    tokenDecimalsCache[token] = 18;
    return 18;
  }
}

async function updateTokenPairPrices(provider, pairAddress) {
  const pair = new ethers.Contract(pairAddress, PairABI, provider);

  try {
    const [token0, token1] = await Promise.all([
      pair.token0(),
      pair.token1(),
    ]);

    const [reserves, decimals0, decimals1] = await Promise.all([
      pair.getReserves(),
      getDecimals(token0, provider),
      getDecimals(token1, provider),
    ]);

    const reserve0 = Number(reserves[0]) / 10 ** decimals0;
    const reserve1 = Number(reserves[1]) / 10 ** decimals1;

    const price = reserve1 && reserve0 ? reserve1 / reserve0 : 0;
    const volumeUSD = Math.min(reserve0, reserve1) * price;

    await TokenPair.findOneAndUpdate(
      { pairAddress },
      {
        $set: {
          token0: token0.toLowerCase(),
          token1: token1.toLowerCase(),
          reserve0,
          reserve1,
          price,
          volumeUSD,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log(`✅ TokenPair updated: ${pairAddress} → $${price.toFixed(6)}`);
  } catch (err) {
    console.error(`❌ Failed to update pair ${pairAddress}:`, err.message);
  }
}

module.exports = { updateTokenPairPrices };
