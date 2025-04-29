// services/enrichNewCoin.js

const { ethers } = require('ethers');
const Coin = require('../models/Coin');

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
};

async function enrichNewCoin(address, network) {
  const provider = providers[network];
  if (!provider) {
    console.warn(`⚠️ Unsupported network: ${network}`);
    return;
  }

  const token = new ethers.Contract(address, ERC20_ABI, provider);

  try {
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();

    const lowerName = name?.toLowerCase() || '';
    const lowerSymbol = symbol?.toLowerCase() || '';

    // Skip LP or spam coins
    if (
      lowerName.includes('lp') || lowerSymbol.includes('lp') ||
      lowerName.includes('pancake') || lowerSymbol.includes('pancake') ||
      lowerName.includes('uniswap') || lowerSymbol.includes('uni') ||
      lowerSymbol.length > 20 || symbol.length === 0
    ) {
      console.warn(`⚠️ Skipping LP or invalid token: ${name} (${symbol})`);
      return;
    }

    if (!name || !symbol || totalSupply.isZero()) {
      console.warn(`⚠️ Invalid token data: ${address}`);
      return;
    }

    const exists = await Coin.findOne({ contractAddress: address.toLowerCase() });
    if (exists) {
      console.log(`ℹ️ Already exists: ${symbol}`);
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
  } catch (err) {
    console.warn(`⚠️ Couldn't fetch token: ${address} - ${err.message}`);
  }
}

module.exports = { enrichNewCoin };
