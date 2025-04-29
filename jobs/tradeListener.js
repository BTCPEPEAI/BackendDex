// jobs/tradeListener.js

global.WebSocket = require('ws'); // WebSocket for ethers.js
const { ethers } = require('ethers');
const Trade = require('../models/Trade');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI } = require('../abis');
const { enrichNewCoin } = require('../services/enrichNewCoin');

// Setup blockchain provider
const provider = new ethers.providers.WebSocketProvider(process.env.BSC_WSS);

// PancakeSwap Factory
const factoryAddress = process.env.BSC_FACTORY;

async function startTradeListener() {
  console.log('📡 Trade listener started...');

  const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);

  factory.on("PairCreated", async (token0, token1, pairAddress) => {
    console.log(`🆕 New trading pair detected: ${pairAddress}`);

    const pair = new ethers.Contract(pairAddress, PairABI, provider);

    pair.on("Swap", async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
      try {
        const txHash = event.transactionHash;
        const amountIn = parseFloat(amount0In.toString()) + parseFloat(amount1In.toString());
        const amountOut = parseFloat(amount0Out.toString()) + parseFloat(amount1Out.toString());

        // 🛑 Prevent duplicate trades
        const exists = await Trade.findOne({ txHash });
        if (exists) {
          return; // Skip if already exists
        }

        const trade = {
          wallet: sender,
          tokenIn: parseFloat(amount0In.toString()) > 0 ? token0 : token1,
          tokenOut: parseFloat(amount0Out.toString()) > 0 ? token0 : token1,
          amountIn,
          amountOut,
          pairAddress,
          txHash,
          timestamp: new Date()
        };

        await Trade.create(trade);
        console.log(`💱 Trade saved: ${txHash}`);

        // Auto enrich token if it's new
        const existingCoin = await Coin.findOne({ contractAddress: trade.tokenIn.toLowerCase() });
        if (!existingCoin) {
          console.log(`🆕 New token detected from trade: ${trade.tokenIn}`);
          await enrichNewCoin(trade.tokenIn, 'bsc');
        }

      } catch (err) {
        console.error(`❌ Error processing swap: ${err.message}`);
      }
    });
  });
}

module.exports = {
  startTradeListener
};
