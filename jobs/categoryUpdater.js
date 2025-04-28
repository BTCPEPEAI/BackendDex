// jobs/categoryUpdater.js

const Coin = require('../models/Coin');

async function updateCategories() {
  try {
    console.log('⏳ Updating coin categories...');

    const allCoins = await Coin.find({ price: { $gt: 0 }, volume: { $gt: 0 } });

    if (allCoins.length === 0) {
      console.warn('⚠️ No valid coins found for categories!');
      return;
    }

    // Trending = Top 20 coins by volume
    const trending = [...allCoins]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Gainers = Top 20 coins by 24h Change %
    const gainers = [...allCoins]
      .filter(c => c.change24h > 0)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Recently Added = Last 20 added coins
    const recentlyAdded = [...allCoins]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Low Volume = Coins with volume < $5000
    const lowVolume = [...allCoins]
      .filter(c => c.volume < 5000)
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Trusted = Admin manually marks trusted coins (already field in Coin model)
    const trusted = await Coin.find({ trusted: true }, 'contractAddress');
    const trustedList = trusted.map(c => c.contractAddress.toLowerCase());

    // Hot Pairs = Top coins by number of recent trades
    // (for now random 20 from available ones)
    const hotPairs = [...allCoins]
      .sort(() => 0.5 - Math.random())
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Save to global database settings
    await updateGlobalCategory('trending', trending);
    await updateGlobalCategory('gainers', gainers);
    await updateGlobalCategory('recently_added', recentlyAdded);
    await updateGlobalCategory('low_volume', lowVolume);
    await updateGlobalCategory('trusted', trustedList);
    await updateGlobalCategory('hot_pairs', hotPairs);

    console.log('✅ Categories updated successfully!');
  } catch (error) {
    console.error('❌ Error updating categories:', error.message);
  }
}

// Helper function to update Global Settings
async function updateGlobalCategory(type, coinList) {
  try {
    const GlobalSettings = require('../models/GlobalSettings');

    await GlobalSettings.updateOne(
      { key: type },
      { $set: { value: coinList } },
      { upsert: true }
    );
  } catch (error) {
    console.error(`❌ Failed to update global category ${type}:`, error.message);
  }
}

module.exports = { updateCategories };
