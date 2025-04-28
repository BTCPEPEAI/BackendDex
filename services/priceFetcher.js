const axios = require('axios');

/**
 * Fetch price from CoinGecko.
 * @param {string} symbol - The symbol of the cryptocurrency.
 * @returns {Promise<number|null>} - The price in USD or null if not found.
 */
async function fetchFromCoinGecko(symbol) {
  try {
    const { data } = await axios.get(`${process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'}/simple/price`, {
      params: { ids: symbol.toLowerCase(), vs_currencies: 'usd' },
    });
    const price = data[symbol.toLowerCase()]?.usd;
    console.log(`✅ CoinGecko price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.error(`⚠️ CoinGecko failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

/**
 * Fetch price from CoinCap.
 */
async function fetchFromCoinCap(symbol) {
  try {
    const { data } = await axios.get(`${process.env.COINCAP_API || 'https://api.coincap.io/v2/assets'}`);
    const coin = data.data.find((c) => c.symbol.toLowerCase() === symbol.toLowerCase());
    if (coin?.priceUsd) {
      console.log(`✅ CoinCap price for ${symbol}: $${coin.priceUsd}`);
      return parseFloat(coin.priceUsd);
    }
    return null;
  } catch (error) {
    console.error(`⚠️ CoinCap failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

/**
 * Fetch price from DexScreener.
 */
async function fetchFromDexScreener(symbol) {
  try {
    const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${symbol}`);
    const price = data.pairs?.[0]?.priceUsd;
    console.log(`✅ DexScreener price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.error(`⚠️ DexScreener failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

/**
 * Fetch price from Moralis.
 */
async function fetchFromMoralis(symbol) {
  try {
    const { data } = await axios.get(`https://deep-index.moralis.io/api/v2/erc20/metadata`, {
      headers: { 'X-API-Key': process.env.MORALIS_API_KEY || '' },
      params: { symbol },
    });
    const price = data?.[0]?.usdPrice;
    console.log(`✅ Moralis price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.error(`⚠️ Moralis failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

/**
 * Fetch price from LiveCoinWatch.
 */
async function fetchFromLiveCoinWatch(symbol) {
  try {
    const { data } = await axios.post(
      `https://api.livecoinwatch.com/coins/single`,
      { code: symbol.toUpperCase(), currency: 'USD' },
      { headers: { 'x-api-key': process.env.LIVECOINWATCH_API_KEY || '' } }
    );
    const price = data.rate;
    console.log(`✅ LiveCoinWatch price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.error(`⚠️ LiveCoinWatch failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

/**
 * Fetch price from CoinAPI.
 */
async function fetchFromCoinAPI(symbol) {
  try {
    const { data } = await axios.get(
      `https://rest.coinapi.io/v1/exchangerate/${symbol}/USD`,
      { headers: { 'X-CoinAPI-Key': process.env.COINAPI_KEY || '' } }
    );
    const price = data.rate;
    console.log(`✅ CoinAPI price for ${symbol}: $${price}`);
    return price || null;
  } catch (error) {
    console.error(`⚠️ CoinAPI failed for ${symbol}:`, error.response?.status || error.message);
    return null;
  }
}

/**
 * Fetch price from all sources until a result is found.
 * @param {string} symbol - The cryptocurrency symbol.
 * @returns {Promise<number|null>} - The price in USD or null if all sources fail.
 */
async function fetchPriceFromSources(symbol) {
  if (!symbol) {
    console.error('⚠️ No symbol provided.');
    return null;
  }

  console.log(`ℹ️ Fetching price for ${symbol} from multiple sources...`);

  // Try each source sequentially
  const sources = [
    fetchFromCoinGecko,
    fetchFromMoralis,
    fetchFromDexScreener,
    fetchFromCoinCap,
    fetchFromLiveCoinWatch,
    fetchFromCoinAPI,
  ];

  for (const source of sources) {
    const price = await source(symbol);
    if (price) return price;
  }

  console.error(`❌ All sources failed for ${symbol}.`);
  return null; // All sources failed
}

module.exports = { fetchPriceFromSources };
