const axios = require('axios');
const PriceCache = require('../models/PriceCache');

const trackedContracts = [
  { contract: '0xdAC17F...', platform: 'ethereum' },
  { contract: '0xA0b869...', platform: 'ethereum' }
];

// Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Check DB for existing data (fresh = updated within 5 mins)
const getCachedPrice = async (contract, platform) => {
  const record = await PriceCache.findOne({ contract, platform });
  if (!record) return null;

  const isFresh = Date.now() - new Date(record.lastUpdated).getTime() < 5 * 60 * 1000;
  return isFresh ? record : null;
};

// Fetch from CoinGecko and store in DB
const fetchAndStorePrice = async (contract, platform) => {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${contract}`;
    const res = await axios.get(url);
    const data = res.data.market_data;

    const priceInfo = {
      price: data?.current_price?.usd,
      change24h: data?.price_change_percentage_24h,
      marketCap: data?.market_cap?.usd,
      lastUpdated: new Date()
    };

    await PriceCache.findOneAndUpdate(
      { contract, platform },
      { ...priceInfo, contract, platform },
      { upsert: true, new: true }
    );

    console.log(`[✔] Fetched and stored price for ${contract}`);
  } catch (e) {
    console.error(`❌ Fetch failed for ${contract}:`, e.response?.status || e.message);
  }
};

// Loop with delay per coin
const updatePrices = async () => {
  for (let coin of trackedContracts) {
    const { contract, platform } = coin;

    const cached = await getCachedPrice(contract, platform);
    if (cached) {
      console.log(`[💾] Used cached price for ${contract}`);
    } else {
      await fetchAndStorePrice(contract, platform);
      await delay(2500); // 2.5s delay between calls
    }
  }
};

// Start the updater every 15 seconds
exports.startPriceUpdater = () => {
  console.log('⏱️ Price updater started...');
  setInterval(updatePrices, 15000); // Every 15s
};
