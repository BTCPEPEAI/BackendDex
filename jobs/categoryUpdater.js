// jobs/categoryUpdater.js

const Coin = require('../models/Coin');
const TokenPair = require('../models/TokenPair');
const GlobalSettings = require('../models/GlobalSettings');

function getPercentageChange(oldPrice, newPrice) {
  if (!oldPrice || oldPrice === 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

async function updateCategories() {
  try {
    console.log('⏳ Updating coin categories...');

    // Fetch pairs with price and volume
    const pairs = await TokenPair.find({ price: { $gt: 0 }, volumeUSD: { $gt: 1 } });

    const trending = [];
    const gainers = [];

    for (const p of pairs) {
      const coin = await Coin.findOne({ contractAddress: p.token0 });

      if (!coin || !p.price) continue;

      const percentChange = getPercentageChange(coin.previousPrice || coin.price, p.price);

      // Update coin with latest price + change
      await Coin.updateOne(
        { contractAddress: coin.contractAddress },
        {
          $set: {
            previousPrice: coin.price || p.price,
            price: p.price,
            priceChange24h: percentChange,
            volumeUSD: p.volumeUSD,
            updatedAt: new Date()
          }
        }
      );

      // Track for categories
      if (p.volumeUSD > 1000) trending.push({ address: coin.contractAddress, volume: p.volumeUSD });
      if (percentChange > 10) gainers.push({ address: coin.contractAddress, change: percentChange });
    }

    // Sort & limit
    const trendingList = trending
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20)
      .map(c => c.address.toLowerCase());

    const gainersList = gainers
      .sort((a, b) => b.change - a.change)
      .slice(0, 20)
      .map(c => c.address.toLowerCase());

    const recentlyAdded = await Coin.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('contractAddress');

    const lowVolume = await Coin.find({ volumeUSD: { $lt: 5000 } })
      .limit(20)
      .select('contractAddress');

    const trusted = await Coin.find({ trusted: true }).select('contractAddress');

    const hotPairs = await Coin.aggregate([{ $sample: { size: 20 } }, { $project: { contractAddress: 1 } }]);

    // Store each category
    await updateGlobalCategory('trending', trendingList);
    await updateGlobalCategory('gainers', gainersList);
    await updateGlobalCategory('recently_added', recentlyAdded.map(c => c.contractAddress.toLowerCase()));
    await updateGlobalCategory('low_volume', lowVolume.map(c => c.contractAddress.toLowerCase()));
    await updateGlobalCategory('trusted', trusted.map(c => c.contractAddress.toLowerCase()));
    await updateGlobalCategory('hot_pairs', hotPairs.map(c => c.contractAddress.toLowerCase()));

    console.log('✅ Categories updated!');
  } catch (err) {
    console.error('❌ Category update error:', err.message);
  }
}

// Save a list into global key:value storage
async function updateGlobalCategory(type, coinList) {
  try {
    await GlobalSettings.updateOne(
      { key: type },
      { $set: { value: coinList } },
      { upsert: true }
    );
  } catch (err) {
    console.error(`❌ Failed to update global setting ${type}:`, err.message);
  }
}

module.exports = { updateCategories };
