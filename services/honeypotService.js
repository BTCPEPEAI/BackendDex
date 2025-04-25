const axios = require('axios');

const checkHoneypot = async (address, chain = 'bsc') => {
  try {
    const { data } = await axios.get(`https://api.honeypot.is/v1/IsHoneypot`, {
      params: {
        address,
        chain
      }
    });

    return {
      isHoneypot: data.honeypotResult?.isHoneypot,
      buyTax: data.honeypotResult?.buyTaxPercent,
      sellTax: data.honeypotResult?.sellTaxPercent,
      gasUsed: data.honeypotResult?.gasUsed,
      error: data.message || null
    };
  } catch (e) {
    console.error('Honeypot check failed:', e.message);
    return { error: 'Honeypot check failed' };
  }
};

module.exports = { checkHoneypot };
