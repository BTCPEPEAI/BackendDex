const CoinPriceCache = require('../models/CoinPriceCache');
const { fetchFromCoinGecko } = require('./externalApiService');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchCoinWithCache(address, network = 'ethereum') {
  const cached = await CoinPriceCache.findOne({ address, network });

  if (cached && Date.now() - new Date(cached.updatedAt).getTime() < 60 * 1000) {
    return cached; // ✅ Return cached value if updated in last 60s
  }

  await delay(2000); // ⏱️ Wait 2 seconds before calling CoinGecko

  const data = await fetchFromCoinGecko(address, network);
  if (!data || !data.price) return null;

  await CoinPriceCache.findOneAndUpdate(
    { address, network },
    { price: data.price, updatedAt: new Date() },
    { upsert: true }
  );

  return { address, network, price: data.price };
}

module.exports = {
  fetchCoinWithCache
};
