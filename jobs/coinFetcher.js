// 📦 src/services/priceFetcher.js

const axios = require('axios');
require('dotenv').config();

// API KEYS
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const LIVECOINWATCH_API_KEY = process.env.LIVECOINWATCH_API_KEY;
const COINAPI_KEY = process.env.COINAPI_KEY;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPrice(tokenSymbolOrAddress) {
  let price = null;

  try {
    // 1. Try Coingecko
    console.log(`🔄 Trying Coingecko for ${tokenSymbolOrAddress}`);
    const coingeckoRes = await axios.get(`${process.env.COINGECKO_API_URL}/simple/price?ids=${tokenSymbolOrAddress}&vs_currencies=usd`);
    if (coingeckoRes.data[tokenSymbolOrAddress] && coingeckoRes.data[tokenSymbolOrAddress].usd) {
      price = coingeckoRes.data[tokenSymbolOrAddress].usd;
      console.log(`✅ Coingecko price for ${tokenSymbolOrAddress}: $${price}`);
      return price;
    }
  } catch (err) {
    console.log(`❌ Coingecko failed for ${tokenSymbolOrAddress}: ${err.response?.status}`);
    await delay(300);
  }

  try {
    // 2. Try CoinCap
    console.log(`🔄 Trying CoinCap for ${tokenSymbolOrAddress}`);
    const coincapRes = await axios.get(`https://rest.coincap.io/v3/assets/${tokenSymbolOrAddress}`, {
      headers: { Authorization: `Bearer ${process.env.COINCAP_API}` }
    });
    if (coincapRes.data.data && coincapRes.data.data.priceUsd) {
      price = coincapRes.data.data.priceUsd;
      console.log(`✅ CoinCap price for ${tokenSymbolOrAddress}: $${price}`);
      return price;
    }
  } catch (err) {
    console.log(`❌ CoinCap failed for ${tokenSymbolOrAddress}: ${err.response?.status}`);
    await delay(300);
  }

  try {
    // 3. Try DexScreener
    console.log(`🔄 Trying DexScreener for ${tokenSymbolOrAddress}`);
    const dexRes = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/bsc/${tokenSymbolOrAddress}`);
    if (dexRes.data.pairs && dexRes.data.pairs[0]?.priceUsd) {
      price = dexRes.data.pairs[0].priceUsd;
      console.log(`✅ DexScreener price for ${tokenSymbolOrAddress}: $${price}`);
      return price;
    }
  } catch (err) {
    console.log(`❌ DexScreener failed for ${tokenSymbolOrAddress}: ${err.response?.status}`);
    await delay(300);
  }

  try {
    // 4. Try Moralis
    console.log(`🔄 Trying Moralis for ${tokenSymbolOrAddress}`);
    const moralisRes = await axios.get(`https://deep-index.moralis.io/api/v2/erc20/${tokenSymbolOrAddress}/price`, {
      headers: { 'X-API-Key': MORALIS_API_KEY }
    });
    if (moralisRes.data.usdPrice) {
      price = moralisRes.data.usdPrice;
      console.log(`✅ Moralis price for ${tokenSymbolOrAddress}: $${price}`);
      return price;
    }
  } catch (err) {
    console.log(`❌ Moralis failed for ${tokenSymbolOrAddress}: ${err.response?.status}`);
    await delay(300);
  }

  try {
    // 5. Try LiveCoinWatch
    console.log(`🔄 Trying LiveCoinWatch for ${tokenSymbolOrAddress}`);
    const livecoinwatchRes = await axios.post(`https://api.livecoinwatch.com/coins/single`, {
      currency: 'USD',
      code: tokenSymbolOrAddress.toUpperCase()
    }, {
      headers: {
        'x-api-key': LIVECOINWATCH_API_KEY,
        'content-type': 'application/json'
      }
    });
    if (livecoinwatchRes.data.rate) {
      price = livecoinwatchRes.data.rate;
      console.log(`✅ LiveCoinWatch price for ${tokenSymbolOrAddress}: $${price}`);
      return price;
    }
  } catch (err) {
    console.log(`❌ LiveCoinWatch failed for ${tokenSymbolOrAddress}: ${err.response?.status}`);
    await delay(300);
  }

  try {
    // 6. Try CoinAPI.io
    console.log(`🔄 Trying CoinAPI for ${tokenSymbolOrAddress}`);
    const coinapiRes = await axios.get(`https://rest.coinapi.io/v1/assets/${tokenSymbolOrAddress}`, {
      headers: { 'X-CoinAPI-Key': COINAPI_KEY }
    });
    if (coinapiRes.data[0] && coinapiRes.data[0].price_usd) {
      price = coinapiRes.data[0].price_usd;
      console.log(`✅ CoinAPI price for ${tokenSymbolOrAddress}: $${price}`);
      return price;
    }
  } catch (err) {
    console.log(`❌ CoinAPI failed for ${tokenSymbolOrAddress}: ${err.response?.status}`);
    await delay(300);
  }

  console.log(`⚠️ No price found for ${tokenSymbolOrAddress}. Skipping.`);
  return null;
}

module.exports = {
  fetchPrice,
};
