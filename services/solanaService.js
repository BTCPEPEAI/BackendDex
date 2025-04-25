const axios = require('axios');
const SolanaToken = require('../models/SolanaToken');

const fetchSolanaTokenList = async () => {
  const url = 'https://raw.githubusercontent.com/solana-labs/token-list/refs/heads/main/src/tokens/solana.tokenlist.json';

  try {
    const res = await axios.get(url);

    // Remove old tokens
    await SolanaToken.deleteMany({});

    // Store first 500 tokens
    await SolanaToken.insertMany(res.data.tokens.slice(0, 500));

    console.log('✅ Solana tokens cached');
  } catch (e) {
    console.error('❌ Solana fetch failed:', e.message);
  }
};

module.exports = { fetchSolanaTokenList };
