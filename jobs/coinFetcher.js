// jobs/coinFetcher.js

const axios = require('axios');
const Coin = require('../models/Coin');

async function fetchCoinsFromCoingecko() {
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: false
      }
    });

    console.log(`✅ Fetched ${data.length} coins from Coingecko.`);

    for (const coin of data) {
      await Coin.updateOne(
        { contractAddress: coin.id }, // Here you should properly match contract address if needed
        {
          name: coin.name,
          symbol: coin.symbol,
          price: coin.current_price,
          marketCap: coin.market_cap,
          volume: coin.total_volume,
          liquidity: coin.total_supply,
          network: 'ethereum',
          updatedAt: new Date()
        },
        { upsert: true }
      );
    }

    console.log('✅ Coin database updated.');
  } catch (err) {
    console.error('❌ Error in fetchCoinsFromCoingecko:', err.message);
  }
}

function startCoinFetcher() {
  console.log('🚀 Coin fetcher started...');

  // Fetch coins every 2 minutes
  fetchCoinsFromCoingecko();
  setInterval(fetchCoinsFromCoingecko, 2 * 60 * 1000);
}

module.exports = { startCoinFetcher };
