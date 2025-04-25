const Coin = require('../models/Coin');
const axios = require('axios');

// ✅ CoinGecko public API
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets';

async function fetchCoinsFromCoinGecko() {
  try {
    const response = await axios.get(COINGECKO_URL, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: false,
      },
    });

    const coins = response.data;

    for (const coin of coins) {
      const exists = await Coin.findOne({ contractAddress: coin.id });

      if (!exists) {
        const newCoin = new Coin({
          contractAddress: coin.id, // You can later replace with real smart contract
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          logo: coin.image,
          price: coin.current_price,
          marketCap: coin.market_cap,
          volume: coin.total_volume,
          network: 'eth', // default ethereum from CoinGecko
          createdAt: new Date(),
        });

        await newCoin.save();
        console.log(`✅ CoinGecko coin saved: ${coin.name}`);
      }
    }
  } catch (error) {
    console.error('❌ fetchCoinsFromCoinGecko error:', error.message);
  }
}

function startCoinFetcher() {
  console.log('🚀 coinFetcher.js started...');
  fetchCoinsFromCoinGecko();
  setInterval(fetchCoinsFromCoinGecko, 1000 * 60 * 60); // Run every 1 hour
}

module.exports = { startCoinFetcher };
