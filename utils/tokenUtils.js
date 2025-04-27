function isLPToken(name = '') {
    const lpWords = ['LP', 'Pancake LPs', 'Cake-LP', 'Liquidity Pool', 'UNI-V2', 'SLP', 'Pair'];
    return lpWords.some(word => name.toUpperCase().includes(word));
  }
  
  module.exports = {
    isLPToken,
  };
  
