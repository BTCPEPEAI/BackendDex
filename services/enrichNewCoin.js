// services/enrichNewCoin.js

const { ethers } = require('ethers');
const Coin = require('../models/Coin');

// ERC20 ABI (simplified for name/symbol/supply)
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)"
];

// Hardcoded RPC Providers
const PROVIDERS = {
  bsc: new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/'),
  eth: new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com'),
  polygon: new ethers.providers.JsonRpcProvider('https://polygon-rpc.com')
};

async function enrichNewCoin(address, network) {
  try {
    const provider = PROVIDERS[network];
    if (!provider) {
      console.warn(`⚠️ Unsupported network: ${network}`);
      return;
    }

    const token = new ethers.Contract(address, ERC20_ABI, provider);

    let name = '', symbol = '', decimals = 18, totalSupply = 0;
    try {
      [name, symbol, decimals, totalSupply] = await Promise.all([
        token.name(),
        token.symbol(),
        token.decimals(),
        token.totalSupply()
      ]);
    } catch (err) {
      console.warn(`⚠️ Failed to fetch token details for ${address}:`, err.message);
      return;
    }

    const lowerName = name.toLowerCase();
    const lowerSymbol = symbol.toLowerCase();
    if (
      lowerName.includes('lp') ||
      lowerSymbol.includes('lp') ||
      lowerName.includes('pancake') ||
      lowerSymbol.includes('pancake')
    ) {
      console.warn(`⚠️ Skipping LP token: ${name} (${symbol})`);
      return;
    }

    if (!name || !symbol || Number(totalSupply) === 0) {
      console.warn(`⚠️ Invalid token info for ${address}`);
      return;
    }

    const exists = await Coin.findOne({ contractAddress: address.toLowerCase() });
    if (exists) {
      console.log(`ℹ️ Already saved: ${symbol}`);
      return;
    }

    const coin = new Coin({
      name,
      symbol,
      decimals,
      contractAddress: address.toLowerCase(),
      network,
      totalSupply: totalSupply.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await coin.save();
    console.log(`✅ Coin saved: ${name} (${symbol})`);
  } catch (error) {
    console.error(`❌ Error saving ${address}:`, error.message);
  }
}

module.exports = { enrichNewCoin };
