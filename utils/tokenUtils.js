// utils/tokenUtils.js

function isLPToken(name) {
  const lower = name.toLowerCase();
  return lower.includes('lp') || lower.includes('liquidity') || lower.includes('pancake') || lower.includes('uniswap') || lower.includes('sushiswap');
}

module.exports = { isLPToken };
