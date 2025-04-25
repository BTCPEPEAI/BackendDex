const axios = require('axios');

exports.fetchFromPumpFun = async () => {
  try {
    const res = await axios.get('https://pump.fun/api/trending');
    // Example only: adjust response depending on real Pump.fun format
    return res.data?.coins?.slice(0, 10) || [];
  } catch {
    return [];
  }
};
