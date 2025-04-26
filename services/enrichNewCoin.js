const Coin = require('../models/Coin');
const { fetchTokenDetails } = require('./coinFetchService');

async function enrichNewCoin(contractAddress, network) {
  console.log(`🔄 Enriching token: ${contractAddress} on network: ${network}`);

  const tokenDetails = await fetchTokenDetails(contractAddress);

  if (!tokenDetails) {
    console.log(`⚠️ Token details not found for ${contractAddress}`);
    return null;
  }

  if (!tokenDetails.name || !tokenDetails.symbol) {
    console.log(`⚠️ Token missing name or symbol: ${contractAddress}`);
    return null;
  }

  // Check if it looks like LP token
  if (
    tokenDetails.name.toLowerCase().includes('pancake lp') ||
    tokenDetails.symbol.toLowerCase().includes('cake-lp') ||
    tokenDetails.name.toLowerCase().includes('lp') ||
    tokenDetails.symbol.toLowerCase().includes('lp')
  ) {
    console.log(`🚫 Skipping LP token: ${tokenDetails.name || tokenDetails.symbol}`);
    return null;
  }

  const existingCoin = await Coin.findOne({ contractAddress });
  if (existingCoin) return existingCoin;

  const newCoin = new Coin({
    contractAddress,
    name: tokenDetails.name,
    symbol: tokenDetails.symbol,
    logo: tokenDetails.logo || 'https://via.placeholder.com/50',
    price: tokenDetails.price || 0,
    network,
    createdAt: new Date(),
  });

  await newCoin.save();
  console.log(`✅ Coin saved: ${tokenDetails.symbol} (${contractAddress})`);

  return newCoin;
}

module.exports = { enrichNewCoin };
