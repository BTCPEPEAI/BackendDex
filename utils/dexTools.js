const { ethers } = require('ethers');
const { FactoryABI, PairABI, ERC20ABI } = require('../abis');

// Set your providers for each network
const providers = {
  bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC),
  eth: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
  polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC),
  tron: null, // For tron and solana we add later separately
  solana: null
};

// Factory addresses (we can expand for ETH and Polygon)
const factoryAddresses = {
  bsc: "0xca143ce32fe78f1f7019d7d551a6402fc5350c73", // PancakeSwap
  eth: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", // Uniswap V2
  polygon: "0x5757371414417b8c6caad45baef941abc7d3ab32", // QuickSwap
};

async function fetchTokenPriceFromPool(tokenAddress, network) {
  try {
    const provider = providers[network];
    if (!provider) throw new Error(`No provider for network: ${network}`);

    const factory = new ethers.Contract(factoryAddresses[network], FactoryABI, provider);

    // Get WETH or WBNB address depending on chain
    const baseToken = await getBaseToken(network);

    // Find pair
    const pairAddress = await factory.getPair(tokenAddress, baseToken);

    if (pairAddress === ethers.constants.AddressZero) {
      throw new Error(`No pool found for token`);
    }

    const pair = new ethers.Contract(pairAddress, PairABI, provider);

    const reserves = await pair.getReserves();
    const token0 = await pair.token0();
    const token1 = await pair.token1();

    // Load token decimals
    const tokenA = new ethers.Contract(token0, ERC20ABI, provider);
    const tokenB = new ethers.Contract(token1, ERC20ABI, provider);

    const [decimalsA, decimalsB] = await Promise.all([
      tokenA.decimals(),
      tokenB.decimals()
    ]);

    let price;

    if (token0.toLowerCase() === tokenAddress.toLowerCase()) {
      // token0 = coin, token1 = base
      price = (reserves._reserve1 / (10 ** decimalsB)) / (reserves._reserve0 / (10 ** decimalsA));
    } else {
      // token1 = coin, token0 = base
      price = (reserves._reserve0 / (10 ** decimalsA)) / (reserves._reserve1 / (10 ** decimalsB));
    }

    const liquidityUsd = ((reserves._reserve0 / (10 ** decimalsA)) + (reserves._reserve1 / (10 ** decimalsB))) * price;

    return {
      price,
      liquidityUsd
    };
  } catch (err) {
    console.error(`❌ [dexTools] Failed fetching live price:`, err.message);
    return null;
  }
}

async function getBaseToken(network) {
  switch (network) {
    case 'bsc':
      return '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'; // WBNB
    case 'eth':
      return '0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2'; // WETH
    case 'polygon':
      return '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'; // WETH (Polygon)
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

module.exports = {
  fetchTokenPriceFromPool
};
