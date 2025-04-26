const axios = require('axios');

// Dexscreener fetch
async function fetchFromDexscreener(contractAddress, network = 'bsc') {
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`;
    const { data } = await axios.get(url);

    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0]; // get first pair

      return {
        name: pair.baseToken?.name || 'Unknown',
        symbol: pair.baseToken?.symbol || 'UNK',
        price: pair.priceUsd ? parseFloat(pair.priceUsd) : 0,
        logo: pair.baseToken?.logoURI || 'https://via.placeholder.com/50'
      };
    }
    return null;
  } catch (error) {
    console.error(`⚠️ Dexscreener error for ${contractAddress}:`, error.message);
    return null;
  }
}

// Coingecko fallback fetch
async function fetchFromCoingecko(contractAddress, network = 'bsc') {
  try {
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${network}/contract/${contractAddress}`;
    const { data } = await axios.get(apiUrl);

    return {
      name: data.name,
      symbol: data.symbol,
      price: data.market_data?.current_price?.usd || 0,
      logo: data.image?.thumb || 'https://via.placeholder.com/50'
    };
  } catch (error) {
    console.error(`⚠️ Coingecko error for ${contractAddress}:`, error.response?.status || error.message);
    return null;
  }
}

// Main fetchTokenDetails function
async function fetchTokenDetails(contractAddress, network = 'bsc') {
  let tokenInfo = await fetchFromDexscreener(contractAddress, network);

  if (tokenInfo && tokenInfo.name !== 'Unknown' && tokenInfo.symbol !== 'UNK') {
    return tokenInfo;
  }

  console.log(`🔄 Trying Coingecko for ${contractAddress}`);
  tokenInfo = await fetchFromCoingecko(contractAddress, network);

  if (tokenInfo && tokenInfo.name && tokenInfo.symbol) {
    return tokenInfo;
  }

  return null;
}

module.exports = { fetchTokenDetails };
