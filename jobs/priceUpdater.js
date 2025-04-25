const Coin = require('../models/Coin');
const { fetchFromCoinGecko } = require('../services/externalApiService');
const { fetchCoinWithCache } = require('../services/coinCacheService');

const tokens = [ 
  { address: '0x...', network: 'ethereum' }, 
  { address: '0x...', network: 'bsc' }, 
  // more tokens
];

const { io } = require('../server'); // 👈 get io instance

// After you update DB price...
io.emit('priceUpdate', {
  address: token.address,
  price: price, // your calculated price
  timestamp: Date.now()
});


async function updatePrices() {
  for (const token of tokens) {
    const result = await fetchCoinWithCache(token.address, token.network);
    console.log(`✅ Updated price for ${token.address}: $${result?.price}`);
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAndStorePrice = async (contract, network) => {
  try {
    const now = Date.now();
    const existing = await Coin.findOne({ address: contract, network });

    // If price exists and is fresh (within 2 minutes), skip fetch
    if (existing && now - new Date(existing.updatedAt).getTime() < 2 * 60 * 1000) {
      console.log(`⏩ Using cached price for ${contract}`);
      return;
    }

    const priceData = await fetchFromCoinGecko(contract, network);
    if (!priceData) throw new Error('No data');

    await Coin.findOneAndUpdate(
      { address: contract, network },
      { ...priceData, updatedAt: new Date() },
      { upsert: true }
    );

    console.log(`✅ Updated price for ${contract}`);
  } catch (err) {
    console.error(`❌ Fetch failed for ${contract}: ${err.response?.status || err.message}`);
  }
};

const startPriceUpdater = async () => {
  console.log('⏱️ Price updater started...');

  const coins = await Coin.find({}).limit(100); // Limit to avoid rate limit

  for (let coin of coins) {
    await fetchAndStorePrice(coin.address, coin.network);
    await delay(2000); // Wait 2 seconds between requests
  }
};

module.exports = {
  startPriceUpdater
};
