// services/coinFetchService.js

const axios = require('axios');
const ethers = require('ethers');

async function fetchTokenDetails(contractAddress, network = 'bsc') {
  try {
    // First try CoinGecko
    const geckoResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${network}/contract/${contractAddress}`);
    const data = geckoResponse.data;

    return {
      name: data.name,
      symbol: data.symbol,
      logo: data.image?.small,
      price: data.market_data?.current_price?.usd,
    };
  } catch (error) {
    console.warn(`⚠️ CoinGecko failed for ${contractAddress}: ${error.response?.status}`);

    // If CoinGecko fails (like 404 or 429), try backup (example: BscScan API, need your API key)
    try {
      const bscResponse = await axios.get(`https://api.bscscan.com/api`, {
        params: {
          module: 'token',
          action: 'tokeninfo',
          contractaddress: contractAddress,
          apikey: process.env.BSCSCAN_API_KEY, // Add your key in .env
        }
      });
      const token = bscResponse.data?.result;

      if (token) {
        return {
          name: token.tokenName,
          symbol: token.tokenSymbol,
          logo: null,
          price: 0, // No price from BscScan
        };
      }
    } catch (err) {
      console.error(`❌ Backup enrich failed for ${contractAddress}`);
      return null;
    }
  }

  return null;
}

module.exports = {
  fetchTokenDetails,
};
