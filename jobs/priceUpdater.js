const CoinPriceCache = require('../models/CoinPriceCache');
const { fetchFromCoinGecko } = require('../services/externalApiService');

const tokens = [
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', network: 'ethereum' }, // USDT
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', network: 'ethereum' }, // USDC
  // Add more tokens here
];

const startPriceUpdater = async () => {
  console.log('⏱️ Price updater started...');

  for (const token of tokens) {
    try {
      const cached = await CoinPriceCache.findOne({
        address: token.address,
        network: token.network
      });

      const now = Date.now();
      const needsUpdate = !cached || now - cached.updatedAt.getTime() > 3000;

      if (needsUpdate) {
        const data = await fetchFromCoinGecko(token.address, token.network);
        await CoinPriceCache.findOneAndUpdate(
          { address: token.address, network: token.network },
          { ...data, updatedAt: new Date() },
          { upsert: true }
        );
        console.log(`✅ Updated: ${token.address}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
    } catch (err) {
      console.error(`❌ Error updating ${token.address}:`, err.message);
    }
  }
};

module.exports = { startPriceUpdater };
