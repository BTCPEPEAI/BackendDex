// jobs/tradeListener.js

global.WebSocket = require('ws'); // WebSocket for ethers.js
const { ethers } = require('ethers');
const Trade = require('../models/Trade');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI } = require('../abis');
const { enrichNewCoin } = require('../services/enrichNewCoin');

// Setup blockchain provider
const provider = new ethers.providers.WebSocketProvider(process.env.BSC_WSS);

// PancakeSwap V2 factory
const factoryAddress = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73";

// Avoid saving duplicate txHashes
const savedTxHashes = new Set();

// LP Token keywords to ignore
const LP_KEYWORDS = ['pancakeswap', 'cake', 'lp', 'uni', 'uniswap', 'pair', 'farm'];

async function startTradeListener() {
  console.log('📡 Trade listener started...');

  const factory = new ethers.Contract(factoryAddress, FactoryABI, provider);

  factory.on("PairCreated", async (token0, token1, pairAddress) => {
    console.log(`🆕 New trading pair detected: ${pairAddress}`);

    const pair = new ethers.Contract(pairAddress, PairABI, provider);

    pair.on("Swap", async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
      try {
        const txHash = event.transactionHash;
        if (savedTxHashes.has(txHash)) {
          return; // skip duplicate tx
        }
        savedTxHashes.add(txHash);

        const amountIn = parseFloat(amount0In.toString()) + parseFloat(amount1In.toString());
        const amountOut = parseFloat(amount0Out.toString()) + parseFloat(amount1Out.toString());

        const tokenInAddress = parseFloat(amount0In.toString()) > 0 ? token0 : token1;
        const tokenOutAddress = parseFloat(amount0Out.toString()) > 0 ? token0 : token1;

        const trade = {
          wallet: sender,
          tokenIn: tokenInAddress,
          tokenOut: tokenOutAddress,
          amountIn,
          amountOut,
          pairAddress,
          txHash,
          timestamp: new Date()
        };

        await Trade.create(trade);
        console.log(`💱 Trade saved: ${txHash}`);

        // ENRICH new token only if it's not a LP
        const existingCoin = await Coin.findOne({ contractAddress: tokenInAddress.toLowerCase() });

        if (!existingCoin) {
          console.log(`🆕 New token detected: ${tokenInAddress}`);
          
          // Clean address format
          const cleanTokenAddress = tokenInAddress.toLowerCase();

          // Fetch enrich and skip if bad token
          const enriched = await enrichNewCoin(cleanTokenAddress, 'bsc');
          if (enriched) {
            const isLp = LP_KEYWORDS.some(keyword =>
              (enriched.name || '').toLowerCase().includes(keyword) ||
              (enriched.symbol || '').toLowerCase().includes(keyword)
            );

            if (isLp) {
              console.log(`🚫 Skipping LP token: ${enriched.name} (${enriched.symbol})`);
              return;
            }

            console.log(`✅ Coin enriched and saved: ${enriched.name} (${enriched.symbol})`);
          }
        }

      } catch (err) {
        console.error(`❌ Error in Swap event:`, err.message);
      }
    });
  });
}

module.exports = { startTradeListener };
