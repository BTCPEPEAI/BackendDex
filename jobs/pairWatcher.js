const { ethers } = require('ethers');
const provider = require('../services/bscProvider');
const TokenPair = require('../models/TokenPair');

const FACTORY_ADDRESS = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';

const FACTORY_ABI = [
  'event PairCreated(address indexed token0, address indexed token1, address pair, uint)',
];

const PAIR_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)',
];

const ERC20_ABI = [
  'function symbol() view returns (string)',
];

const watchPairs = async () => {
  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

  factory.on('PairCreated', async (token0, token1, pairAddress) => {
    console.log(`🆕 New Pair Detected: ${token0} + ${token1} = ${pairAddress}`);

    try {
      const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
      const [reserve0, reserve1] = await pair.getReserves();

      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

      const symbol0 = await token0Contract.symbol();
      const symbol1 = await token1Contract.symbol();

      const price = reserve1 / reserve0;

      await TokenPair.create({
        pairAddress,
        token0,
        token1,
        token0Symbol: symbol0,
        token1Symbol: symbol1,
        reserve0: reserve0.toString(),
        reserve1: reserve1.toString(),
        price,
        volumeUSD: 0,
        lastUpdated: new Date(),
      });

      console.log(`✅ Saved: ${symbol0}/${symbol1} | Price: ${price.toFixed(4)}`);

      // 👇 Add real-time swap listener for this pair
      pair.on('Swap', async (...args) => {
        try {
          const event = args[args.length - 1];
          const [amount0In, amount1In, amount0Out, amount1Out] = args;

          const amountIn = ethers.formatUnits(amount0In || amount1In, 18);
          const amountOut = ethers.formatUnits(amount0Out || amount1Out, 18);
          const volume = parseFloat(amountIn) + parseFloat(amountOut);

          await TokenPair.findOneAndUpdate(
            { pairAddress },
            {
              $inc: { volumeUSD: volume },
              lastUpdated: new Date(),
            }
          );

          console.log(`💸 Swap: $${volume.toFixed(2)} on ${symbol0}/${symbol1}`);
        } catch (swapErr) {
          console.error(`❌ Swap event error for ${pairAddress}:`, swapErr.message);
        }
      });
    } catch (err) {
      console.error(`❌ Failed to handle pair ${pairAddress}:`, err.message);
    }
  });
};

module.exports = { watchPairs };
