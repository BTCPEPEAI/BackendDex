const axios = require('axios');
const { setPrice } = require('../services/priceCache');

// Example: these should come from admin coins
const trackedContracts = [
  { contract: '0xdAC17F...', platform: 'ethereum' },
  { contract: '0xA0b869...', platform: 'ethereum' }
];

const fetchPrice = async (contract, platform) => {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${contract}`;
    const res = await axios.get(url);
    const data = res.data.market_data;

    return {
      price: data?.current_price?.usd,
      change24h: data?.price_change_percentage_24h,
      marketCap: data?.market_cap?.usd,
      lastUpdated: new Date()
    };
  } catch (e) {
    console.error('Price fetch error:', contract, e.message);
    return null;
  }
};

const updatePrices = async () => {
  for (let coin of trackedContracts) {
    const data = await fetchPrice(coin.contract, coin.platform);
    if (data) setPrice(coin.contract, data);
  }
};

exports.startPriceUpdater = () => {
  setInterval(updatePrices, 3000); // Every 3s
};
