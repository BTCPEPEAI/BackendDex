const Coin = require('../models/Coin');
const { fetchTokenDetails } = require('../services/coinFetchService');
const { fetchTokenInfoFromScan } = require('../services/scanService'); // NEW (we will create it)

const enrichNewCoin = async (contractAddress, network = 'bsc') => {
  console.log(`🔄 Enriching token: ${contractAddress} on network: ${network}`);

  try {
    // 1. Try fetch from CoinGecko
    let tokenDetails = await fetchTokenDetails(contractAddress, network);

    // 2. If CoinGecko fails, try BscScan or EtherScan
    if (!tokenDetails || !tokenDetails.name || !tokenDetails.symbol) {
      console.log(`⚠️ CoinGecko failed for ${contractAddress}, trying Scan API...`);
      tokenDetails = await fetchTokenInfoFromScan(contractAddress, network);
    }

    // 3. If still no name/symbol — skip
    if (!tokenDetails || !tokenDetails.name || !tokenDetails.symbol) {
      console.log(`❌ No valid name/symbol for ${contractAddress}, skipping.`);
      return;
    }

    // 4. Skip if token is LP (liquidity pool)
    if (tokenDetails.symbol.toLowerCase().includes('lp') || tokenDetails.name.toLowerCase().includes('lp')) {
      console.log(`❌ LP token detected (${tokenDetails.symbol}), skipping.`);
      return;
    }

    // 5. Skip if price is 0
    if (!tokenDetails.price || tokenDetails.price === 0) {
      console.log(`❌ Token ${tokenDetails.symbol} price is 0, skipping.`);
      return;
    }

    // 6. Check if already exists
    const existing = await Coin.findOne({ contractAddress });
    if (existing) {
      console.log(`✅ Token already exists: ${existing.symbol}`);
      return existing;
    }

    // 7. Save the clean token
    const newCoin = new Coin({
      contractAddress,
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      logo: tokenDetails.logo || 'https://via.placeholder.com/50',
      price: tokenDetails.price,
      network,
      createdAt: new Date(),
    });

    await newCoin.save();
    console.log(`✅ Coin saved: ${newCoin.name} (${newCoin.symbol})`);

    return newCoin;

  } catch (error) {
    console.error(`❌ Error enriching ${contractAddress}:`, error.message);
  }
};

module.exports = { enrichNewCoin };
