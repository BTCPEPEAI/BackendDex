const { ethers } = require('ethers');
const TokenPair = require('../models/TokenPair');
const { PairABI } = require('../abis');

// RPC & Base Configurations (hardcoded)
const NETWORKS = {
  bsc: {
    rpc: 'https://bsc-dataseed.binance.org/',
    factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
    base: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  },
  eth: {
    rpc: 'https://eth.llamarpc.com',
    factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    base: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  polygon: {
    rpc: 'https://polygon-rpc.com',
    factory: '0x5757371414417b8c6caad45baef941abc7d3ab32',
    base: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
  }
};

async function updateTokenPairPrices() {
  for (const [network, config] of Object.entries(NETWORKS)) {
    const provider = new ethers.providers.JsonRpcProvider(config.rpc);

    try {
      const pairs = await TokenPair.find({ network });

      for (const pair of pairs) {
        try {
          const contract = new ethers.Contract(pair.pairAddress, PairABI, provider);
          const [r0, r1] = await contract.getReserves();
          const token0 = await contract.token0();
          const token1 = await contract.token1();

          // Determine if token0 or token1 is the base token
          let baseIsToken0 = token0.toLowerCase() === config.base.toLowerCase();
          let baseIsToken1 = token1.toLowerCase() === config.base.toLowerCase();

          let price = 0;
          if (baseIsToken0) {
            price = parseFloat(ethers.utils.formatUnits(r1, 18)) / parseFloat(ethers.utils.formatUnits(r0, 18));
          } else if (baseIsToken1) {
            price = parseFloat(ethers.utils.formatUnits(r0, 18)) / parseFloat(ethers.utils.formatUnits(r1, 18));
          } else {
            console.warn(`⚠️ Skipping pair ${pair.pairAddress} on ${network} — base token not found`);
            continue;
          }

          const volumeUSD = Math.max(parseFloat(ethers.utils.formatUnits(r0, 18)), parseFloat(ethers.utils.formatUnits(r1, 18))) * price;

          await TokenPair.updateOne(
            { _id: pair._id },
            {
              $set: {
                price: price,
                volumeUSD: volumeUSD,
                updatedAt: new Date()
              }
            }
          );

          console.log(`✅ [${network}] Updated ${pair.token0.symbol}/${pair.token1.symbol} → $${price.toFixed(6)} | Vol: $${volumeUSD.toFixed(2)}`);
        } catch (err) {
          console.error(`❌ Failed updating pair ${pair.pairAddress} on ${network}: ${err.message}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error fetching token pairs for ${network}: ${err.message}`);
    }
  }
}

function startTokenPairUpdater() {
  console.log('📊 Starting token pair updater...');
  updateTokenPairPrices();
  setInterval(updateTokenPairPrices, 10000); // every 10 seconds
}

module.exports = { startTokenPairUpdater };
