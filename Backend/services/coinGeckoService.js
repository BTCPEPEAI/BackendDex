const axios = require('axios');

const BASE_URL = 'https://api.coingecko.com/api/v3/coins';

exports.getCoinMetrics = async (contract, platform = 'ethereum') => {
  try {
    const res = await axios.get(`${BASE_URL}/${platform}/contract/${contract}`);
    const coin = res.data;

    return {
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image?.small || coin.image?.thumb,
      marketCap: coin.market_data?.market_cap?.usd,
      fdv: coin.market_data?.fully_diluted_valuation?.usd,
      auditLinks: coin.links?.repos_url?.github || [],
      homepage: coin.links?.homepage?.[0],
      coingeckoRank: coin.coingecko_rank,
      categories: coin.categories
    };
  } catch (err) {
    throw new Error('CoinGecko: Token not found or invalid');
  }
};
