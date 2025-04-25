module.exports = [
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "to", "type": "address" }
      ],
      "name": "Swap",
      "type": "event"
    }
  ];
  
  module.exports = [
    "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)",
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
  ];
  
