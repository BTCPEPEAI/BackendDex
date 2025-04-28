const axios = require('axios');

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens';
const COINCAP_API = 'https://api.coincap.io/v2/assets';
const MORALIS_API = 'https://deep-index.moralis.io/api/v2/erc20';
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

// Helper to wait
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Try Coingecko first
async function fetchFromCoingecko(contractAddress, network = 'bsc') {
  try {
    const id = {
      bsc: 'binance-smart-chain',
      eth: 'ethereum',
      polygon: 'polygon-pos'
    }[network] || 'binance-smart-chain';

    const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/contract/${contractAddress}`);
    return res.data.market_data.current_price.usd;
  } catch (err) {
    console.warn(`⚠️ Coingecko error for ${contractAddress}: ${err.response?.status}`);
    return null;
  }
}

// Try CoinCap
async function fetchFromCoinCap(symbol) {
  try {
    const res = await axios.get(`${COINCAP_API}`);
    const coins = res.data.data;
    const match = coins.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
    if (match) return parseFloat(match.priceUsd);
    return null;
  } catch (err) {
    console.warn(`⚠️ CoinCap error: ${err.response?.status}`);
    return null;
  }
}

// Try Dexscreener
async function fetchFromDexscreener(contractAddress) {
  try {
    const res = await axios.get(`${DEXSCREENER_API}/${contractAddress}`);
    const pairs = res.data.pairs;
    if (pairs && pairs.length > 0) {
      return parseFloat(pairs[0].priceUsd);
    }
    return null;
  } catch (err) {
    console.warn(`⚠️ Dexscreener error for ${contractAddress}: ${err.response?.status}`);
    return null;
  }
}

// Try Moralis
async function fetchFromMoralis(contractAddress) {
  try {
    const res = await axios.get(`${MORALIS_API}/${contractAddress}/price`, {
      headers: { 'X-API-Key': MORALIS_API_KEY }
    });
    return res.data.usdPrice;
  } catch (err) {
    console.warn(`⚠️ Moralis error for ${contractAddress}: ${err.response?.status}`);
    return null;
  }
}

// 🧠 Main function: Smart price fetcher
async function fetchPriceSmart(contractAddress, network = 'bsc', symbol = '') {
  let price = null;

  // Coingecko
  price = await fetchFromCoingecko(contractAddress, network);
  if (price) return price;
  await delay(1000);

  // CoinCap (only works by symbol)
  if (symbol) {
    price = await fetchFromCoinCap(symbol);
    if (price) return price;
  }
  await delay(1000);

  // Dexscreener
  price = await fetchFromDexscreener(contractAddress);
  if (price) return price;
  await delay(1000);

  // Moralis
  price = await fetchFromMoralis(contractAddress);
  if (price) return price;

  // All failed
  return null;
}

module.exports = {
  fetchPriceSmart
};
