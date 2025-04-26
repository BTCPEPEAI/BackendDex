const { enrichNewCoin } = require('../services/enrichNewCoin');
require('dotenv').config();

async function test() {
  const contractAddress = '0x55d398326f99059fF775485246999027B3197955'; // Example USDT (real contract) on BSC
  await enrichNewCoin(contractAddress, 'bsc');

  console.log('✅ Enrichment complete!');
  process.exit(0);
}

test();
