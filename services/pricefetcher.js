// services/priceFetcher.js

const axios = require('axios');

async function fetchFromCoinGecko(symbol) {
  try {
    const { data } = await axios.get(`${process.env.COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: symbol.toLowerCase(),
        vs_currencies: 'usd'
      }
    });
    const price = data[symbol.toLowerCase()]?.usd;
    if (price) {
      console.log(`✅ Price from CoinGecko for ${symbol}: $${price}`);
      return price;
    }
    return null;
  } catch (error) {
    console.error(`⚠️ CoinGecko failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

async function fetchFromCoinCap(symbol) {
  try {
    const { data } = await axios.get(`${process.env.COINCAP_API}`);
    const coin = data.data.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
    if (coin?.priceUsd) {
      console.log(`✅ Price from CoinCap for ${symbol}: $${coin.priceUsd}`);
      return coin.priceUsd;
    }
    return null;
  } catch (error) {
    console.error(`⚠️ CoinCap failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

async function fetchFromDexScreener(symbol) {
  try {
    const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${symbol}`);
    const price = data.pairs?.[0]?.priceUsd;
    if (price) {
      console.log(`✅ Price from DexScreener for ${symbol}: $${price}`);
      return price;
    }
    return null;
  } catch (error) {
    console.error(`⚠️ DexScreener failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

async function fetchFromMoralis(symbol) {
  try {
    const { data } = await axios.get(`https://deep-index.moralis.io/api/v2/erc20/metadata`, {
      headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
      params: { symbol }
    });
    const price = data?.[0]?.usdPrice;
    if (price) {
      console.log(`✅ Price from Moralis for ${symbol}: $${price}`);
      return price;
    }
    return null;
  } catch (error) {
    console.error(`⚠️ Moralis failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

async function fetchFromLiveCoinWatch(symbol) {
  try {
    const { data } = await axios.post(`https://api.livecoinwatch.com/coins/single`, {
      code: symbol.toUpperCase(),
      currency: "USD"
    }, {
      headers: { 'x-api-key': process.env.LIVECOINWATCH_API_KEY }
    });
    const price = data.rate;
    if (price) {
      console.log(`✅ Price from LiveCoinWatch for ${symbol}: $${price}`);
      return price;
    }
    return null;
  } catch (error) {
    console.error(`⚠️ LiveCoinWatch failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

async function fetchFromCoinAPI(symbol) {
  try {
    const { data } = await axios.get(`https://rest.coinapi.io/v1/exchangerate/${symbol}/USD`, {
      headers: { 'X-CoinAPI-Key': process.env.COINAPI_KEY }
    });
    const price = data.rate;
    if (price) {
      console.log(`✅ Price from CoinAPI for ${symbol}: $${price}`);
      return price;
    }
    return null;
  } catch (error) {
    console.error(`⚠️ CoinAPI failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

// MAIN FUNCTION
async function fetchPriceFromSources(symbol) {
  if (!symbol) return null;

  // Try each source one by one
  let price = await fetchFromCoinGecko(symbol);
  if (price) return price;

  price = await fetchFromMoralis(symbol);
  if (price) return price;

  price = await fetchFromDexScreener(symbol);
  if (price) return price;

  price = await fetchFromCoinCap(symbol);
  if (price) return price;

  price = await fetchFromLiveCoinWatch(symbol);
  if (price) return price;

  price = await fetchFromCoinAPI(symbol);
  if (price) return price;

  return null; // All failed
}

module.exports = { fetchPriceFromSources };
