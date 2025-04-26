const axios = require('axios');
const Coin = require('../models/Coin');

async function importSolanaTokens() {
  console.log('🚀 Importing Solana token list...');

  try {
    // Fetch Solana token list
    const { data } = await axios.get('https://raw.githubusercontent.com/solana-labs/token-list/refs/heads/main/src/tokens/solana.tokenlist.json');
    
    const tokens = data.tokens || [];

    let added = 0;
    for (const token of tokens) {
      const existing = await Coin.findOne({ contractAddress: token.address });

      if (!existing) {
        const newCoin = new Coin({
          contractAddress: token.address,
          name: token.name || 'Unknown',
          symbol: token.symbol || 'UNK',
          logo: token.logoURI || 'https://via.placeholder.com/50',
          price: 0, // Will be updated later by priceUpdater
          network: 'solana',
          createdAt: new Date(),
        });

        await newCoin.save();
        added++;
      }
    }

    console.log(`✅ Imported ${added} new Solana tokens.`);

    // Clean bad/unknown coins
    const deleted = await Coin.deleteMany({
      $or: [
        { name: 'Unknown' },
        { symbol: 'UNK' },
        { price: { $lte: 0 } }
      ]
    });

    console.log(`🧹 Cleaned ${deleted.deletedCount} bad coins.`);
  } catch (error) {
    console.error('❌ Error importing Solana tokens:', error.message);
  }
}

// Run immediately if you call directly
if (require.main === module) {
  importSolanaTokens().then(() => {
    console.log('✅ Solana tokens import done.');
    process.exit();
  });
}

module.exports = { importSolanaTokens };
