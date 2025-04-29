// jobs/tradeListener.js

const { ethers } = require('ethers');
const Coin = require('../models/Coin');
const Trade = require('../models/Trade');
const { FactoryABI, PairABI } = require('../abis');
const { enrichNewCoin } = require('../services/enrichNewCoin');

// PROVIDERS for different chains
const providerBSC = new ethers.providers.WebSocketProvider(process.env.BSC_WSS);
// (Later we can add ETH, POLYGON, etc. providers)

async function startTradeListener() {
  console.log('📡 Trade listener started...');

  // PancakeSwap Factory on BSC
  const factoryBSC = new ethers.Contract(
    "0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
    FactoryABI,
    providerBSC
  );

  factoryBSC.on("PairCreated", async (token0, token1, pairAddress) => {
    console.log(`🆕 New Pair Created: ${pairAddress} (${token0}/${token1})`);

    const pair = new ethers.Contract(pairAddress, PairABI, providerBSC);

    pair.on("Swap", async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
      try {
        const txHash = event.transactionHash;
        const amountIn = parseFloat(ethers.utils.formatUnits(amount0In, 18)) + parseFloat(ethers.utils.formatUnits(amount1In, 18));
        const amountOut = parseFloat(ethers.utils.formatUnits(amount0Out, 18)) + parseFloat(ethers.utils.formatUnits(amount1Out, 18));

        const trade = {
          wallet: sender,
          tokenIn: amount0In.gt(0) ? token0 : token1,
          tokenOut: amount0Out.gt(0) ? token0 : token1,
          amountIn,
          amountOut,
          pairAddress,
          txHash,
          timestamp: new Date()
        };

        await Trade.create(trade);
        console.log(`💱 Trade saved: ${txHash}`);

        // ENRICH TOKEN
        const existingCoin = await Coin.findOne({ contractAddress: trade.tokenIn.toLowerCase() });

        if (!existingCoin) {
          console.log(`🆕 New token detected: ${trade.tokenIn}`);
          await enrichNewCoin(trade.tokenIn, 'bsc', pairAddress);
        } else {
          // Save Pair Address if missing
          if (!existingCoin.pairAddress) {
            existingCoin.pairAddress = pairAddress;
            await existingCoin.save();
            console.log(`🔗 Pair address saved for token: ${existingCoin.symbol}`);
          }
        }

      } catch (err) {
        console.error(`❌ Error processing Swap: ${err.message}`);
      }
    });
  });
}

module.exports = {
  startTradeListener
};
