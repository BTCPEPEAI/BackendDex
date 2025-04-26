const Coin = require('../models/Coin');
const Trade = require('../models/Trade');
const { fetchTokenDetails } = require('../services/coinFetchService');
await enrichNewCoin(contractAddress, 'bsc'); // or eth, polygon etc.

async function indexNewCoins() {
  try {
    const recentTrades = await Trade.find({}).sort({ timestamp: -1 }).limit(100);

    for (const trade of recentTrades) {
      const existingCoin = await Coin.findOne({ contractAddress: trade.pairAddress });

      if (!existingCoin) {
        console.log(`🆕 New token detected: ${trade.pairAddress}`);

        const tokenDetails = await fetchTokenDetails(trade.pairAddress);
        if (!tokenDetails) continue;

        const newCoin = new Coin({
          contractAddress: trade.pairAddress,
          name: tokenDetails.name || 'Unknown',
          symbol: tokenDetails.symbol || 'UNK',
          logo: tokenDetails.logo || 'https://via.placeholder.com/50',
          price: tokenDetails.price || 0,
          network: 'bsc', // default, you can detect chain better later
          createdAt: new Date(),
        });

        await newCoin.save();
        console.log(`✅ Coin saved: ${tokenDetails.symbol}`);
      }
    }
  } catch (error) {
    console.error('❌ indexNewCoins error:', error.message);
  }
}

const newTokens = ["0x123...", "0x456...", "0x789..."]; // Example list

for (const tokenAddress of newTokens) {
  await enrichNewCoin(tokenAddress, 'bsc');
}


// Run every 5 seconds
setInterval(indexNewCoins, 5000);

console.log('🚀 coinIndexer.js started...');
