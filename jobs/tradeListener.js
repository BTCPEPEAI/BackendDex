global.WebSocket = require('ws'); // WebSocket for blockchain listening
const { ethers } = require('ethers');
const Trade = require('../models/Trade');
const { FactoryABI, PairABI } = require('../abis'); // your ABIs
const provider = new ethers.providers.WebSocketProvider(process.env.BSC_WSS); // WSS from env
const { enrichNewCoin } = require('../services/enrichNewCoin');

const factoryAddress = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73"; // PancakeSwap V2 Factory

const startTradeListener = async () => {
  const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);

  factory.on("PairCreated", async (token0, token1, pairAddress) => {
    console.log(`🆕 New pair detected: ${pairAddress}`);
    // Listen for swaps on new pairs
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

    // Enrich immediately after detecting pair
    try {
      await enrichNewCoin(pairAddress, 'bsc');
    } catch (err) {
      console.error(`❌ Error enriching token:`, err.message);
    }
  });

  console.log('📡 Trade listener started...');
};

module.exports = { startTradeListener };
