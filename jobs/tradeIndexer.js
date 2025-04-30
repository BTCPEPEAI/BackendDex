// jobs/tradeIndexer.js

const { ethers } = require('ethers');
const Trade = require('../models/Trade');
const { PairABI } = require('../abis');

// Hardcoded RPCs (adjust if needed)
const networks = {
  bsc: {
    rpc: 'https://bsc-dataseed.binance.org/',
    factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
  },
  eth: {
    rpc: 'https://eth.llamarpc.com',
    factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  },
  polygon: {
    rpc: 'https://polygon-rpc.com',
    factory: '0x5757371414417b8c6caad45baef941abc7d3ab32',
  }
};

async function startTradeIndexer() {
  console.log('📡 Trade listener started...');

  for (const [network, config] of Object.entries(networks)) {
    const provider = new ethers.providers.JsonRpcProvider(config.rpc);

    provider.on('pending', async (txHash) => {
      try {
        const tx = await provider.getTransaction(txHash);
        if (!tx || !tx.to) return;

        // Decode swap data later using ABI if needed

        // Simple example of saving trade (customize based on real needs)
        const trade = new Trade({
          txHash,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          network,
          timestamp: Date.now()
        });

        await trade.save();
        console.log(`💱 Trade saved: ${txHash}`);
      } catch (err) {
        // Ignore missing transactions
      }
    });
  }
}

module.exports = { startTradeIndexer };
