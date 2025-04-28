const axios = require('axios');

// API keys
const COINCAP_API = process.env.COINCAP_API;
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const LIVECOINWATCH_API_KEY = process.env.LIVECOINWATCH_API_KEY;
const COINAPI_KEY = process.env.COINAPI_KEY;

// Utility sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Try CoinGecko first
async function fetchFromCoinGecko(symbol) {
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: { ids: symbol.toLowerCase(), vs_currencies: 'usd' }
    });
    const price = data[symbol.toLowerCase()]?.usd;
    if (price) console.log(`✅ CoinGecko price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.log(`⚠️ CoinGecko failed for ${symbol}: ${error.response?.status || error.message}`);
    return null;
  }
}

// Try CoinCap if CoinGecko fails
async function fetchFromCoinCap(symbol) {
  try {
    const { data } = await axios.get(COINCAP_API);
    const coin = data.data.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
    const price = coin?.priceUsd;
    if (price) console.log(`✅ CoinCap price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.log(`⚠️ CoinCap failed for ${symbol}: ${error.response?.status || error.message}`);
    return null;
  }
}

// Try Moralis if needed
async function fetchFromMoralis(symbol) {
  try {
    const { data } = await axios.get(`https://deep-index.moralis.io/api/v2/erc20/metadata/search?query=${symbol}`, {
      headers: { 'X-API-Key': MORALIS_API_KEY }
    });
    const token = data?.result?.[0];
    const price = token?.usdPrice;
    if (price) console.log(`✅ Moralis price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.log(`⚠️ Moralis failed for ${symbol}: ${error.response?.status || error.message}`);
    return null;
  }
}

// Try LiveCoinWatch
async function fetchFromLiveCoinWatch(symbol) {
  try {
    const { data } = await axios.post('https://api.livecoinwatch.com/coins/single', {
      currency: "USD",
      code: symbol.toUpperCase(),
      meta: true
    }, {
      headers: {
        'x-api-key': LIVECOINWATCH_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    const price = data.rate;
    if (price) console.log(`✅ LiveCoinWatch price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.log(`⚠️ LiveCoinWatch failed for ${symbol}: ${error.response?.status || error.message}`);
    return null;
  }
}

// Try CoinAPI
async function fetchFromCoinApi(symbol) {
  try {
    const { data } = await axios.get(`https://rest.coinapi.io/v1/assets`, {
      headers: { 'X-CoinAPI-Key': COINAPI_KEY }
    });
    const token = data.find(asset => asset.asset_id.toLowerCase() === symbol.toLowerCase());
    const price = token?.price_usd;
    if (price) console.log(`✅ CoinAPI price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.log(`⚠️ CoinAPI failed for ${symbol}: ${error.response?.status || error.message}`);
    return null;
  }
}

// Main function to fetch price from all sources
async function fetchPriceFromSources(symbol) {
  const sources = [
    fetchFromCoinGecko,
    fetchFromCoinCap,
    fetchFromMoralis,
    fetchFromLiveCoinWatch,
    fetchFromCoinApi
  ];

  for (const source of sources) {
    const price = await source(symbol);
    if (price) return price;

    // Delay between each source to avoid spamming
    await sleep(1000);
  }

  console.log(`❌ All sources failed for ${symbol}`);
  return null;
}

module.exports = { fetchPriceFromSources };
