const Coin = require('../models/Coin');
const Trade = require('../models/Trade');
const { fetchTokenDetails } = require('../services/coinFetchService');

/**
 * Enrich a list of new token addresses with additional details and save them to the database.
 * @param {Array<string>} tokenAddresses - Array of token contract addresses.
 * @param {string} network - The blockchain network (e.g., 'bsc', 'eth', etc.).
 */
async function enrichNewCoins(tokenAddresses, network = 'bsc') {
  for (const tokenAddress of tokenAddresses) {
    try {
      console.log(`🔄 Enriching token: ${tokenAddress} on network: ${network}`);
      const tokenDetails = await fetchTokenDetails(tokenAddress);

      if (!tokenDetails) {
        console.warn(`⚠️ No details found for token: ${tokenAddress}`);
        continue;
      }

      const newCoin = new Coin({
        contractAddress: tokenAddress,
        name: tokenDetails.name || 'Unknown',
        symbol: tokenDetails.symbol || 'UNK',
        logo: tokenDetails.logo || 'https://via.placeholder.com/50',
        price: tokenDetails.price || 0,
        network, // Default to the provided network
        createdAt: new Date(),
      });

      await newCoin.save();
      console.log(`✅ Coin saved: ${tokenDetails.symbol} (${tokenAddress})`);
    } catch (error) {
      console.error(`❌ Error enriching token ${tokenAddress}:`, error.message);
    }
  }
}

/**
 * Index new coins detected from recent trades.
 */
async function indexNewCoins() {
  try {
    console.log('🔍 Fetching recent trades...');
    const recentTrades = await Trade.find({}).sort({ timestamp: -1 }).limit(100);

    for (const trade of recentTrades) {
      const existingCoin = await Coin.findOne({ contractAddress: trade.pairAddress });

      if (!existingCoin) {
        console.log(`🆕 New token detected: ${trade.pairAddress}`);
        await enrichNewCoins([trade.pairAddress], 'bsc'); // Default network is 'bsc'
      }
    }
  } catch (error) {
    console.error('❌ indexNewCoins error:', error.message);
  }
}

// Example list of new tokens to enrich
const newTokens = ["0x123...", "0x456...", "0x789..."];
enrichNewCoins(newTokens, 'bsc')
  .then(() => console.log('✅ Initial token enrichment complete.'))
  .catch(error => console.error('❌ Error during initial enrichment:', error.message));

// Run the indexer every 5 seconds
setInterval(indexNewCoins, 5000);

console.log('🚀 coinIndexer.js started...');
