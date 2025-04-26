const axios = require('axios');

const BSC_SCAN_API = process.env.BSCSCAN_API_KEY;
const ETHERSCAN_API = process.env.ETHERSCAN_API_KEY;

const fetchTokenInfoFromScan = async (address, network = 'bsc') => {
  try {
    let url;
    if (network === 'bsc') {
      url = `https://api.bscscan.com/api?module=token&action=tokeninfo&contractaddress=${address}&apikey=${BSC_SCAN_API}`;
    } else if (network === 'eth') {
      url = `https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${address}&apikey=${ETHERSCAN_API}`;
    } else {
      return null;
    }

    const response = await axios.get(url);

    if (response.data.status === '1') {
      const token = response.data.result;
      return {
        name: token.TokenName,
        symbol: token.Symbol,
        price: 0, // No price info from scan, will fill later
      };
    } else {
      console.log(`⚠️ Scan API returned no data for ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching from scan:`, error.message);
    return null;
  }
};

module.exports = { fetchTokenInfoFromScan };
