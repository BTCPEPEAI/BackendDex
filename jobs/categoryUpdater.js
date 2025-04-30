const Coin = require('../models/Coin');
const GlobalSettings = require('../models/GlobalSettings');

function getPercentageChange(oldPrice, newPrice) {
  if (!oldPrice || oldPrice === 0 || !newPrice) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

async function updateGlobalCategory(type, coinList) {
  try {
    await GlobalSettings.updateOne(
      { key: type },
      { $set: { value: coinList } },
      { upsert: true }
    );
  } catch (err) {
    console.error(`❌ Failed to update ${type}:`, err.message);
  }
}

async function updateCategories() {
  try {
    console.log('⏳ Updating coin categories...');

    const coins = await Coin.find({ price: { $gt: 0 }, volume: { $gt: 0 } });
    if (coins.length === 0) {
      console.warn('⚠️ No valid coins found to categorize!');
      return;
    }

    // Trending: top by volume
    const trending = [...coins]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Gainers: positive price change %
    const gainers = [...coins]
      .map(c => ({
        ...c._doc,
        change24h: getPercentageChange(c.previousPrice || c.price, c.price)
      }))
      .filter(c => c.change24h > 0)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Recently added
    const recentlyAdded = [...coins]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Low volume coins
    const lowVolume = coins
      .filter(c => c.volume < 5000)
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    // Trusted tokens (admin flag)
    const trustedTokens = await Coin.find({ trusted: true }, 'contractAddress');
    const trusted = trustedTokens.map(c => c.contractAddress.toLowerCase());

    // Hot Pairs (random coins)
    const hotPairs = [...coins]
      .sort(() => 0.5 - Math.random())
      .slice(0, 20)
      .map(c => c.contractAddress.toLowerCase());

    await updateGlobalCategory('trending', trending);
    await updateGlobalCategory('gainers', gainers);
    await updateGlobalCategory('recently_added', recentlyAdded);
    await updateGlobalCategory('low_volume', lowVolume);
    await updateGlobalCategory('trusted', trusted);
    await updateGlobalCategory('hot_pairs', hotPairs);

    console.log('✅ Category update complete!');
  } catch (err) {
    console.error('❌ Error updating categories:', err.message);
  }
}

module.exports = { updateCategories };
