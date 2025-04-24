const axios = require('axios');
const CoinGeckoApi = 'https://api.coingecko.com/api/v3';
const DEXTOOLS_API = 'https://www.dextools.io/shared/data/pool'; // placeholder, needs proxy for CORS

// Fetch details from CoinGecko by contract address
exports.fetchFromCoinGecko = async (contract, platform = 'ethereum') => {
  try {
    const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${platform}/contract/${contract}`);
    const data = res.data;

    return {
      name: data.name,
      symbol: data.symbol,
      image: data.image?.thumb || data.image?.small,
      price: data.market_data?.current_price?.usd,
      change24h: data.market_data?.price_change_percentage_24h,
      marketCap: data.market_data?.market_cap?.usd,
      liquidity: null,
      links: data.links,
    };
  } catch (err) {
    return null;
  }
};

// (Optional) Fetch from DEXTools or Pump.fun (you’ll need proxies or SDKs for full access)
exports.fetchExtraData = async (contract) => {
  // Placeholder: would need a backend proxy or custom script
  return {
    liquidity: 123456, // replace with real logic
  };
};
