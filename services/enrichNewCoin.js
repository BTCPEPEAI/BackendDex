vconst Coin = require('../models/Coin');
const axios = require('axios');

async function enrichNewCoin(contractAddress, network = 'bsc') {
  console.log(`🔄 Enriching token: ${contractAddress} on network: ${network}`);

  let tokenDetails = null;

  // Skip clearly invalid LP tokens (simple check)
  if (!contractAddress || contractAddress.length !== 42) {
    console.log(`⚠️ Invalid token address skipped: ${contractAddress}`);
    return;
  }

  // Try Dexscreener first
  try {
    const dexRes = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
    if (dexRes.data.pairs && dexRes.data.pairs.length > 0) {
      const pair = dexRes.data.pairs[0];

      // Check if it looks like a real token (avoid LP tokens)
      if (pair.baseToken.name.toLowerCase().includes('lp') || pair.baseToken.symbol.toLowerCase().includes('lp')) {
        console.log(`⚠️ LP token detected and skipped: ${contractAddress}`);
        return;
      }

      tokenDetails = {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: parseFloat(pair.priceUsd) || 0,
        logo: pair.baseToken.logoURI || 'https://via.placeholder.com/50',
        network: network,
      };
    }
  } catch (err) {
    console.log(`⚠️ Dexscreener error for ${contractAddress}: ${err.response?.status || err.message}`);
  }

  // If Dexscreener failed, Try Coingecko
  if (!tokenDetails) {
    try {
      console.log(`🔄 Trying Coingecko for ${contractAddress}...`);
      const cgList = await axios.get('https://api.coingecko.com/api/v3/coins/list?include_platform=true');
      for (const coin of cgList.data) {
        if (coin.platforms && coin.platforms[network] && coin.platforms[network].toLowerCase() === contractAddress.toLowerCase()) {
          const cgDetails = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
          tokenDetails = {
            name: cgDetails.data.name,
            symbol: cgDetails.data.symbol,
            price: cgDetails.data.market_data.current_price.usd || 0,
            logo: cgDetails.data.image.large || 'https://via.placeholder.com/50',
            network: network,
          };
          break;
        }
      }
    } catch (err) {
      console.log(`⚠️ Coingecko error for ${contractAddress}: ${err.response?.status || err.message}`);
    }
  }

  // Final checks before saving
  if (tokenDetails && tokenDetails.name && tokenDetails.symbol && tokenDetails.price > 0) {
    const existing = await Coin.findOne({ contractAddress });
    if (!existing) {
      await Coin.create({
        contractAddress,
        ...tokenDetails,
        createdAt: new Date(),
      });
      console.log(`✅ Coin saved: ${tokenDetails.symbol} (${contractAddress})`);
    } else {
      console.log(`ℹ️ Coin already exists: ${tokenDetails.symbol}`);
    }
  } else {
    console.log(`⚠️ No valid details found for token: ${contractAddress}, skipping save`);
  }

  // Small delay to avoid hitting API rate limits
  await new Promise(resolve => setTimeout(resolve, 1200));
}

module.exports = { enrichNewCoin };
