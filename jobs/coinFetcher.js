// jobs/coinFetcher.js

const axios = require('axios');
const Coin = require('../models/Coin');

const COINCAP_API = 'https://api.coincap.io/v2/assets';
const cache = new Set(); // memory cache to prevent duplicates

async function fetchFromCoinGecko() {
  console.log('🔄 Fetching from CoinGecko...');
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

    console.log(`✅ Got ${data.length} coins from CoinGecko.`);
    return data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.current_price,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      liquidity: coin.total_supply,
      image: coin.image,
      network: 'ethereum',
    }));

  } catch (error) {
    console.error('❌ CoinGecko failed:', error.response?.status || error.message);
    throw new Error('CoinGecko failed');
  }
}

async function fetchFromCoinCap() {
  console.log('🔄 Fetching from CoinCap...');
  try {
    const { data } = await axios.get(COINCAP_API);
    console.log(`✅ Got ${data.data.length} coins from CoinCap.`);
    return data.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.priceUsd,
      marketCap: coin.marketCapUsd,
      volume: coin.volumeUsd24Hr,
      liquidity: coin.supply,
      image: null,
      network: 'ethereum',
    }));

  } catch (error) {
    console.error('❌ CoinCap failed:', error.response?.status || error.message);
    throw new Error('CoinCap failed');
  }
}

// Later we can add LiveCoinWatch, Moralis, Dexscreener fallback too

async function fetchCoins() {
  let coins = [];

  try {
    coins = await fetchFromCoinGecko();
  } catch {
    try {
      coins = await fetchFromCoinCap();
    } catch {
      console.error('❌ All APIs failed! Waiting 15s before retry.');
      setTimeout(fetchCoins, 15000);
      return;
    }
  }

  for (const coin of coins) {
    if (!coin.name || !coin.symbol || !coin.price || cache.has(coin.symbol)) {
      continue;
    }

    cache.add(coin.symbol.toLowerCase());

    await Coin.updateOne(
      { symbol: coin.symbol },
      {
        $set: {
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          marketCap: coin.marketCap,
          volume: coin.volume,
          liquidity: coin.liquidity,
          image: coin.image,
          network: coin.network,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  console.log(`✅ Coin database updated with ${coins.length} coins.`);
}

function startCoinFetcher() {
  console.log('🚀 Coin fetcher started...');
  fetchCoins();
  setInterval(fetchCoins, 2 * 60 * 1000); // every 2 minutes refresh
}

module.exports = { startCoinFetcher };
