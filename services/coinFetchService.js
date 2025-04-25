const axios = require('axios');

async function fetchTokenDetails(address) {
  try {
    // ✅ Try fetching basic token info here (replace with real API)
    // Example: return dummy data now
    return {
      name: 'Unknown',
      symbol: 'UNK',
      logo: 'https://via.placeholder.com/50',
      price: 0,
    };
  } catch (error) {
    console.error('❌ fetchTokenDetails error:', error.message);
    return null;
  }
}

module.exports = { fetchTokenDetails };
