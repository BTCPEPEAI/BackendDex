// jobs/tradeListener.js

const { ethers } = require('ethers');
const Trade = require('../models/Trade');
const Coin = require('../models/Coin');
const { FactoryABI, PairABI } = require('../abis');
const { enrichNewCoin } = require('../services/enrichNewCoin');

const WSS_PROVIDERS = {
  bsc: new ethers.providers.WebSocketProvider(process.env.BSC_WSS),
  eth: new ethers.providers.WebSocketProvider(process.env.ETH_WSS),
  polygon: new ethers.providers.WebSocketProvider(process.env.POLYGON_WSS)
};

const FACTORIES = {
  bsc: process.env.BSC_FACTORY,
  eth: process.env.ETH_FACTORY,
  polygon: process.env.POLYGON_FACTORY
};

function startTradeListener() {
  console.log('📡 Trade listener started...');

  for (const [network, provider] of Object.entries(WSS_PROVIDERS)) {
    const factory = new ethers.Contract(FACTORIES[network], FactoryABI, provider);

    factory.on('PairCreated', async (token0, token1, pairAddress) => {
      console.log(`🆕 New Pair Created: ${pairAddress} (${token0}/${token1})`);

      const pair = new ethers.Contract(pairAddress, PairABI, provider);

      pair.on('Swap', async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
        try {
          const txHash = event.transactionHash;

          // Prevent duplicate trades
          const exists = await Trade.findOne({ txHash });
          if (exists) return;

          const amountIn = parseFloat(amount0In.toString()) + parseFloat(amount1In.toString());
          const amountOut = parseFloat(amount0Out.toString()) + parseFloat(amount1Out.toString());

          const trade = {
            wallet: sender,
            tokenIn: parseFloat(amount0In.toString()) > 0 ? token0 : token1,
            tokenOut: parseFloat(amount0Out.toString()) > 0 ? token0 : token1,
            amountIn,
            amountOut,
            pairAddress,
            txHash,
            network,
            timestamp: new Date()
          };

          await Trade.create(trade);
          console.log(`💱 Trade saved: ${txHash}`);

          // Enrich both tokens
          const tokens = [token0.toLowerCase(), token1.toLowerCase()];
          for (const address of tokens) {
            const exists = await Coin.findOne({ contractAddress: address });
            if (!exists) {
              console.log(`🆕 New token detected: ${address}`);
              await enrichNewCoin(address, network);
            }
          }
        } catch (err) {
          if (err.code === 11000) {
            console.warn(`⚠️ Duplicate trade skipped: ${err.message}`);
          } else {
            console.error(`❌ Error processing Swap: ${err.message}`);
          }
        }
      });
    });
  }
}

module.exports = { startTradeListener };
