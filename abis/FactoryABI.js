module.exports = [
  {
    "name": "getPair",
    "type": "function",
    "inputs": [
      { "name": "tokenA", "type": "address" },
      { "name": "tokenB", "type": "address" }
    ],
    "outputs": [
      { "name": "pair", "type": "address" }
    ],
    "stateMutability": "view"
  }
  // You can include other events like PairCreated if needed
];

  module.exports = [
    "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
  ];
  
