global.WebSocket = require('ws'); // Add this line at the top
const { ethers } = require('ethers');
const Trade = require('../models/Trade');
const { FactoryABI, PairABI } = require('../abis'); // make sure you have these ABIs
const provider = new ethers.providers.WebSocketProvider(process.env.BSC_WSS); // or ETH WSS
const { enrichNewCoin } = require('../services/enrichNewCoin');

const factoryAddress = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73"; // ✅ All lowercase bypasses checksum

 // PancakeSwap V2 factory

const startTradeListener = async () => {
  const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);

  factory.on("PairCreated", async (token0, token1, pairAddress) => {
    const pair = new ethers.Contract(pairAddress, PairABI, provider);

    pair.on("Swap", async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
      const txHash = event.transactionHash;

      const trade = {
        wallet: sender,
        tokenIn: parseFloat(amount0In.toString()) > 0 ? token0 : token1,
        tokenOut: parseFloat(amount0Out.toString()) > 0 ? token0 : token1,
        amountIn: parseFloat(amount0In.toString()) + parseFloat(amount1In.toString()),
        amountOut: parseFloat(amount0Out.toString()) + parseFloat(amount1Out.toString()),
        pairAddress,
        txHash,
        timestamp: new Date()
      };

      await Trade.create(trade);
      console.log(`💱 Trade saved: ${txHash}`);
    });
  });

  console.log('📡 Trade listener started...');
};

// inside your event listener for new pairs/trades
async function handleNewTrade(tradeData) {
  const { tokenAddress } = tradeData; // or wherever your trade event has the coin address

  if (!tokenAddress) {
    console.log('No token address found in trade.');
    return;
  }

  try {
    const enriched = await enrichNewCoin(tokenAddress, 'bsc'); // default network = bsc

    if (enriched) {
      console.log(`✅ Enriched and saved ${enriched.name} (${enriched.symbol})`);
    }
  } catch (error) {
    console.error(`❌ Error enriching coin:`, error.message);
  }
}

module.exports = { startTradeListener };
