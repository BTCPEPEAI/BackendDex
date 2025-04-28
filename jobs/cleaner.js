// jobs/cleaner.js

const Coin = require('../models/Coin');

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');

    // Find UNK, fake, or bad coins
    const badCoins = await Coin.find({
      $or: [
        { name: { $in: [null, '', 'UNK', 'Unknown'] } },
        { symbol: { $in: [null, '', 'UNK', 'Unknown'] } },
        { price: { $lte: 0 } },
        { volume: { $lte: 0 } },
        { logo: { $in: [null, '', 'https://via.placeholder.com/50'] } }
      ]
    });

    // Delete bad coins
    for (const coin of badCoins) {
      await Coin.deleteOne({ _id: coin._id });
      console.log(`❌ Deleted bad coin: ${coin.name} (${coin.symbol})`);
    }

    // Now handle duplicate coins
    console.log('🔎 Checking for duplicate coins...');
    const coins = await Coin.find({});
    const seenAddresses = new Set();
    const duplicateCoins = [];

    for (const coin of coins) {
      const address = coin.contractAddress.toLowerCase();
      if (seenAddresses.has(address)) {
        duplicateCoins.push(coin._id); // Duplicate found
      } else {
        seenAddresses.add(address);
      }
    }

    // Delete duplicates
    if (duplicateCoins.length > 0) {
      await Coin.deleteMany({ _id: { $in: duplicateCoins } });
      console.log(`✅ Deleted ${duplicateCoins.length} duplicate coins.`);
    } else {
      console.log('✅ No duplicate coins found.');
    }

    console.log('✅ Database cleanup completed!');
  } catch (error) {
    console.error('❌ Error during database cleanup:', error.message);
  }
}

// Manual Run
if (require.main === module) {
  cleanDatabase().then(() => {
    console.log('🧹 Cleanup finished. Exiting...');
    process.exit(0);
  });
}

module.exports = { cleanDatabase };
