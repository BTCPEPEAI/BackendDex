const priceMap = new Map(); // key = contract, value = price data

exports.setPrice = (contract, data) => {
  priceMap.set(contract, data);
};

exports.getPrice = (contract) => {
  return priceMap.get(contract) || null;
};

exports.getMultiplePrices = (contracts = []) => {
  return contracts.map((c) => ({
    contract: c,
    ...priceMap.get(c)
  }));
};
