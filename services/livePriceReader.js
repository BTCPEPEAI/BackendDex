// services/livePriceReader.js

const { ethers } = require('ethers');
const { PairABI } = require('../abis');

// Factory routers (add more if needed)
const routers = {
  bsc: {
    rpc: process.env.BSC_RPC,
    tokens: {
      stable: '0x55d398326f99059fF775485246999027B3197955', // USDT
      wrapped: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    }
  },
  eth: {
    rpc: process.env.ETH_RPC,
    tokens: {
      stable: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      wrapped: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    }
  },
  polygon: {
    rpc: process.env.POLYGON_RPC,
    tokens: {
      stable: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
      wrapped: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
    }
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPriceFromPair(tokenAddress, network = 'bsc') {
  const net = routers[network];
  if (!net) {
    console.warn(`⚠️ Unknown network: ${network}`);
    return null;
  }

  const provider = new ethers.providers.JsonRpcProvider(net.rpc);

  const referenceToken = net.tokens.stable;
  const wrappedToken = net.tokens.wrapped;

  const pairsToTry = [
    [tokenAddress, referenceToken],
    [tokenAddress, wrappedToken],
  ];

  for (const [token0, token1] of pairsToTry) {
    const pairAddress = await findPairAddress(provider, token0, token1);
    if (!pairAddress) continue;

    const price = await readPriceFromPair(provider, pairAddress, token0, token1);
    if (price) return price;

    await sleep(500); // Delay between tries
  }

  return null;
}

async function findPairAddress(provider, tokenA, tokenB) {
  try {
    const factory = new ethers.Contract(
      process.env.BSC_FACTORY, // fallback to BSC
      [
        'function getPair(address tokenA, address tokenB) external view returns (address pair)'
      ],
      provider
    );

    const pair = await factory.getPair(tokenA, tokenB);
    if (pair === ethers.constants.AddressZero) return null;
    return pair;
  } catch (err) {
    console.error(`❌ Failed to get pair address: ${err.message}`);
    return null;
  }
}

async function readPriceFromPair(provider, pairAddress, token0, token1) {
  try {
    const pair = new ethers.Contract(pairAddress, PairABI, provider);
    const [reserve0, reserve1] = await pair.getReserves();
    const token0Addr = await pair.token0();
    const token1Addr = await pair.token1();

    const isOrderCorrect = token0.toLowerCase() === token0Addr.toLowerCase();

    const price = isOrderCorrect
      ? reserve1 / reserve0
      : reserve0 / reserve1;

    return price > 0 && price < 1000000 ? price : null;
  } catch (err) {
    console.warn(`⚠️ Error reading price from pair ${pairAddress}:`, err.message);
    return null;
  }
}

module.exports = { getPriceFromPair };
