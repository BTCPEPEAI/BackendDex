// jobs/categoryUpdater.js

const Coin = require('../models/Coin');
const AutoCategory = require('../models/AutoCategory');

const updateCategories = async () => {
  console.log("⏳ Updating coin categories...");

  try {
    // 🟡 Trending: Top 20 coins by 24h volume
    const trending = await Coin.find().sort({ volume24h: -1 }).limit(20);
    await AutoCategory.findOneAndUpdate(
      { category: 'trending' },
      { coins: trending.map(c => c.contractAddress), updatedAt: new Date() },
      { upsert: true }
    );

    // 🟢 Gainers: Top 20 coins by 24h price change
    const gainers = await Coin.find().sort({ change24h: -1 }).limit(20);
    await AutoCategory.findOneAndUpdate(
      { category: 'gainers' },
      { coins: gainers.map(c => c.contractAddress), updatedAt: new Date() },
      { upsert: true }
    );

    // 🔴 Low Volume: bottom 20 coins by 24h volume
    const lowVolume = await Coin.find().sort({ volume24h: 1 }).limit(20);
    await AutoCategory.findOneAndUpdate(
      { category: 'low-volume' },
      { coins: lowVolume.map(c => c.contractAddress), updatedAt: new Date() },
      { upsert: true }
    );

    // 🆕 New: created in last 48 hours
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const recent = await Coin.find({ createdAt: { $gte: twoDaysAgo } }).sort({ createdAt: -1 }).limit(20);
    await AutoCategory.findOneAndUpdate(
      { category: 'new' },
      { coins: recent.map(c => c.contractAddress), updatedAt: new Date() },
      { upsert: true }
    );

    // 🛡️ Trusted: has isTrusted = true or audit = "Passed"
    const trusted = await Coin.find({ $or: [{ audit: "Passed" }, { isTrusted: true }] }).limit(20);
    await AutoCategory.findOneAndUpdate(
      { category: 'trusted' },
      { coins: trusted.map(c => c.contractAddress), updatedAt: new Date() },
      { upsert: true }
    );

    console.log("✅ Categories updated!");
  } catch (err) {
    console.error("❌ Category updater error:", err.message);
  }
};

module.exports = { updateCategories };
