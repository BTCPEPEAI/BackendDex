// src/services/enrichNewCoin.js

const axios = require('axios');
const Coin = require('../models/Coin');

async function enrichNewCoin(address, network = 'bsc') {
  try {
    // 1. Try CoinGecko first
    const cgResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${network}/contract/${address}`);
    const data = cgResponse.data;

    if (!data) {
      console.log(`❌ No data found on CoinGecko for ${address}`);
      return null;
    }

    const coinData = {
      name: data.name || "Unknown",
      symbol: data.symbol || "UNK",
      contractAddress: address,
      price: data.market_data?.current_price?.usd || 0,
      marketCap: data.market_data?.market_cap?.usd || 0,
      change24h: data.market_data?.price_change_percentage_24h || 0,
      liquidity: data.liquidity_score || 0,
      image: data.image?.large || "",
      network: network,
      launchDate: data.genesis_date || "",
    };

    // 2. Save into Coins Collection
    await Coin.updateOne(
      { contractAddress: address },
      { $set: coinData },
      { upsert: true }
    );

    console.log(`✅ Enriched and saved ${coinData.name} (${coinData.symbol})`);
    return coinData;
  } catch (error) {
    console.error(`❌ Error enriching coin ${address}:`, error.message);
    return null;
  }
}

module.exports = { enrichNewCoin };
