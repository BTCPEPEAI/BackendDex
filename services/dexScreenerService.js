const axios = require('axios');

// DexScreener base endpoint (no key needed)
const DEX_SCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens';

exports.getTokenInfoFromDexScreener = async (contract) => {
  const url = `${DEX_SCREENER_API}/${contract}`;
  const res = await axios.get(url);

  if (!res.data || !res.data.pairs || res.data.pairs.length === 0) {
    throw new Error('No token data found on DexScreener');
  }

  const pair = res.data.pairs[0]; // Choose best match

  return {
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    priceUsd: pair.priceUsd,
    priceNative: pair.priceNative,
    volume24h: pair.volume.h24,
    txns: pair.txns.h24,
    liquidity: pair.liquidity.usd,
    chain: pair.chainId,
    dex: pair.dexId,
    chart: pair.url,
    poolCreated: pair.pairCreatedAt
  };
};
