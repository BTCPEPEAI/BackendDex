const axios = require('axios');
const COINGECKO_API = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

const fetchPriceFromCoinGecko = async (contractAddress, network = 'bsc') => {
  try {
    let platform = 'binance-smart-chain';
    if (network === 'eth') platform = 'ethereum';
    if (network === 'polygon') platform = 'polygon-pos';
    if (network === 'sol') platform = 'solana';

    const url = `${COINGECKO_API}/coins/${platform}/contract/${contractAddress}`;

    const response = await axios.get(url);

    const data = response.data.market_data;

    return {
      price: data.current_price.usd,
      volume: data.total_volume.usd,
      priceChange24h: data.price_change_percentage_24h,
    };

  } catch (error) {
    console.error(`❌ fetchPriceFromCoinGecko Error:`, error.message);
    return null;
  }
};

module.exports = { fetchPriceFromCoinGecko };
