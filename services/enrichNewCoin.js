// services/enrichNewCoin.js

const axios = require('axios');
const Coin = require('../models/Coin');
const { fetchPriceFromSources } = require('./priceFetcher');
const { isLPToken } = require('../utils/tokenUtils');

// Helper: Fetch token info from BSCScan
async function fetchTokenInfoFromBSCScan(address) {
  try {
    const { data } = await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'token',
        action: 'tokeninfo',
        contractaddress: address,
        apikey: process.env.BSCSCAN_API_KEY,
      }
    });

    if (data.status !== "1") {
      console.log(`⚠️ BSCScan info not found for ${address}`);
      return null;
    }

    const info = data.result[0];
    return {
      name: info.tokenName,
      symbol: info.symbol,
      decimals: Number(info.decimals),
      totalSupply: info.totalSupply,
    };
  } catch (error) {
    console.error(`❌ Error fetching token info for ${address}:`, error.message);
    return null;
  }
}

// Main Enrich Function
async function enrichNewCoin(address, network = 'bsc') {
  try {
    if (!address) return;

    address = address.toLowerCase();

    const exists = await Coin.findOne({ contractAddress: address });
    if (exists) {
      console.log(`⚠️ Coin already exists: ${address}`);
      return;
    }

    console.log(`🔄 Enriching token: ${address} on network: ${network}`);

    // Fetch token info
    const tokenInfo = await fetchTokenInfoFromBSCScan(address);
    if (!tokenInfo) {
      console.log(`⚠️ No token info for ${address}`);
      return;
    }

    const { name, symbol, decimals, totalSupply } = tokenInfo;

    // Skip if LP Token
    if (isLPToken(name) || isLPToken(symbol)) {
      console.log(`🚫 Skipped LP Token: ${address}`);
      return;
    }

    // Fetch price
    const price = await fetchPriceFromSources(symbol);
    if (!price) {
      console.log(`⚠️ No price found for ${symbol} (${address})`);
      return;
    }

    // Save valid coin
    const newCoin = new Coin({
      name,
      symbol,
      contractAddress: address,
      price: parseFloat(price),
      decimals,
      totalSupply,
      network,
      createdAt: new Date(),
    });

    await newCoin.save();
    console.log(`✅ Coin saved: ${symbol} (${address})`);

  } catch (error) {
    console.error(`❌ Error enriching token ${address}:`, error.message);
  }
}

module.exports = { enrichNewCoin };
