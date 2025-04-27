const Coin = require('../models/Coin');
const axios = require('axios');
const { isLPToken } = require('../utils/tokenUtils'); // helper to detect LP tokens

// Simple in-memory cache (could replace later with Redis for bigger)
const tokenCache = new Map();

// Fetch delay between retries
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch token details from Coingecko
async function fetchFromCoingecko(contractAddress, network) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${network}/contract/${contractAddress}`;
    const { data } = await axios.get(url);
    if (data && data.name && data.symbol) {
      return {
        name: data.name,
        symbol: data.symbol,
        logo: data.image?.small,
        price: data.market_data?.current_price?.usd,
        volume: data.market_data?.total_volume?.usd,
      };
    }
  } catch (err) {
    console.warn(`⚠️ Coingecko error for ${contractAddress}: ${err.response?.status || err.message}`);
  }
  return null;
}

// Fetch token details from Dexscreener
async function fetchFromDexscreener(contractAddress) {
  try {
    const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
    const pair = data?.pairs?.[0];
    if (pair) {
      return {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        logo: pair.baseToken.logoURI,
        price: parseFloat(pair.priceUsd),
        volume: parseFloat(pair.volume.h24),
      };
    }
  } catch (err) {
    console.warn(`⚠️ Dexscreener error for ${contractAddress}: ${err.response?.status || err.message}`);
  }
  return null;
}

// Fetch from CoinCap
async function fetchFromCoincap(contractAddress) {
  try {
    const { data } = await axios.get(`https://api.coincap.io/v3/assets`);
    const match = data.data.find(c => c.symbol.toLowerCase() === contractAddress.slice(0, 4).toLowerCase());
    if (match) {
      return {
        name: match.name,
        symbol: match.symbol,
        price: match.priceUsd,
        volume: match.volumeUsd24Hr,
      };
    }
  } catch (err) {
    console.warn(`⚠️ Coincap error: ${err.response?.status || err.message}`);
  }
  return null;
}

// Fetch from Moralis
async function fetchFromMoralis(contractAddress) {
  try {
    const { data } = await axios.get(`https://deep-index.moralis.io/api/v2/erc20/metadata?chain=bsc&addresses[]=${contractAddress}`, {
      headers: {
        'X-API-Key': process.env.MORALIS_API_KEY
      }
    });
    const token = data[0];
    if (token && token.name && token.symbol) {
      return {
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        price: token.usdPrice,
        volume: 0, // Moralis doesn't provide volume easily
      };
    }
  } catch (err) {
    console.warn(`⚠️ Moralis error for ${contractAddress}: ${err.response?.status || err.message}`);
  }
  return null;
}

// The Smart Enrich Function
async function enrichNewCoin(contractAddress, network = 'bsc') {
  try {
    if (tokenCache.has(contractAddress)) {
      console.log(`⚡ Cache hit: ${contractAddress}`);
      return tokenCache.get(contractAddress);
    }

    console.log(`🔄 Enriching token: ${contractAddress} on network: ${network}`);

    const sources = [
      fetchFromCoingecko,
      fetchFromDexscreener,
      fetchFromCoincap,
      fetchFromMoralis,
    ];

    let tokenDetails = null;
    for (const source of sources) {
      tokenDetails = await source(contractAddress, network);
      if (tokenDetails) break;
      await wait(2000); // Wait 2s before next API
    }

    if (!tokenDetails || !tokenDetails.name || !tokenDetails.symbol || !tokenDetails.price || tokenDetails.price <= 0) {
      console.warn(`⚠️ No valid details found for ${contractAddress}`);
      return null;
    }

    if (isLPToken(tokenDetails.name)) {
      console.warn(`🚫 Skipping LP Token: ${contractAddress} (${tokenDetails.name})`);
      return null;
    }

    // Save new Coin in DB
    const newCoin = new Coin({
      contractAddress,
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      logo: tokenDetails.logo || 'https://via.placeholder.com/50',
      price: tokenDetails.price,
      volume: tokenDetails.volume || 0,
      network,
      createdAt: new Date(),
    });

    await newCoin.save();
    tokenCache.set(contractAddress, newCoin);

    console.log(`✅ Coin saved: ${newCoin.symbol} (${contractAddress})`);
    return newCoin;

  } catch (err) {
    console.error(`❌ Error enriching token ${contractAddress}:`, err.message);
    return null;
  }
}

module.exports = {
  enrichNewCoin,
};
