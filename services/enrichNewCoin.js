// services/enrichNewCoin.js

const { ethers } = require('ethers');
const Coin = require('../models/Coin');

// ERC20 ABI to fetch name/symbol/supply
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
];

// Setup Providers
const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

async function enrichNewCoin(address, network) {
  try {
    const provider = providers[network];
    if (!provider) {
      console.warn(`⚠️ Unsupported network: ${network}`);
      return;
    }

    const token = new ethers.Contract(address, ERC20_ABI, provider);

    let name = '', symbol = '', totalSupply = 0;

    try {
      name = await token.name();
      symbol = await token.symbol();
      totalSupply = await token.totalSupply();
    } catch (err) {
      console.warn(`⚠️ Couldn't fetch details for token: ${address}`);
      return; // skip if can't fetch
    }

    // Skip LP tokens
    const lowerName = name.toLowerCase();
    const lowerSymbol = symbol.toLowerCase();

    if (lowerName.includes('lp') || lowerSymbol.includes('lp') || lowerName.includes('pancake') || lowerSymbol.includes('pancake')) {
      console.warn(`⚠️ Skipping LP token: ${name} (${symbol})`);
      return;
    }

    // Check if totalSupply makes sense
    if (!name || !symbol || Number(totalSupply) === 0) {
      console.warn(`⚠️ Invalid token, skipping: ${address}`);
      return;
    }

    // Check if already saved
    const existing = await Coin.findOne({ contractAddress: address.toLowerCase() });
    if (existing) {
      console.log(`ℹ️ Coin already exists: ${symbol}`);
      return;
    }

    const coin = new Coin({
      name,
      symbol,
      contractAddress: address.toLowerCase(),
      network,
      totalSupply: totalSupply.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await coin.save();
    console.log(`✅ Coin saved: ${name} (${symbol})`);

  } catch (error) {
    console.error(`❌ Error enriching token ${address}:`, error.message);
  }
}

module.exports = { enrichNewCoin };
