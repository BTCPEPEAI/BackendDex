// jobs/coinFetcher.js

const axios = require('axios');
const Coin = require('../models/Coin'); // your Mongoose Coin model

async function startCoinFetcher() {
  console.log('🚀 coinFetcher started...');

  while (true) {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false
        }
      });

      const coins = response.data;

      for (const coin of coins) {
        await Coin.updateOne(
          { contractAddress: coin.id }, // you might need to map address properly
          {
            name: coin.name,
            symbol: coin.symbol,
            price: coin.current_price,
            volume: coin.total_volume,
            liquidity: coin.total_supply,
            network: 'ethereum', // or bsc if fetched from bsc
            updatedAt: new Date()
          },
          { upsert: true }
        );
      }

      console.log(`✅ Fetched and saved ${coins.length} coins`);

    } catch (error) {
      console.error('❌ Error fetching coins:', error.message);
    }

    await sleep(3000); // Sleep for 3 sec before next fetch
  }
}

module.exports = { startCoinFetcher };
