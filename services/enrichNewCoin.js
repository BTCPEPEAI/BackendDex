const Coin = require('../models/Coin');
const axios = require('axios');

// API Keys
const COINCAP_API = process.env.COINCAP_API;
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const LIVECOINWATCH_API_KEY = process.env.LIVECOINWATCH_API_KEY;
const COINAPI_KEY = process.env.COINAPI_KEY;

// Utility function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchFromCoinGecko(contractAddress, network) {
  try {
    const url = `${process.env.COINGECKO_API_URL}/coins/${network}/contract/${contractAddress}`;
    const { data } = await axios.get(url);
    return {
      name: data.name,
      symbol: data.symbol,
      price: data.market_data.current_price.usd || 0,
      logo: data.image.small || '',
    };
  } catch (error) {
    console.log(`⚠️ CoinGecko failed for ${contractAddress}: ${error.response?.status}`);
    return null;
  }
}

async function fetchFromCoinCap(contractAddress) {
  try {
    const { data } = await axios.get(`${COINCAP_API}`);
    const asset = data.data.find(asset => asset.id === contractAddress.toLowerCase());
    if (!asset) return null;
    return {
      name: asset.name,
      symbol: asset.symbol,
      price: parseFloat(asset.priceUsd) || 0,
      logo: '', // Coincap API doesn't provide logos
    };
  } catch (error) {
    console.log(`⚠️ CoinCap failed for ${contractAddress}: ${error.response?.status}`);
    return null;
  }
}

async function fetchFromMoralis(contractAddress, network) {
  try {
    const chain = network === 'bsc' ? 'bsc' : 'eth';
    const { data } = await axios.get(`https://deep-index.moralis.io/api/v2/erc20/metadata?chain=${chain}&addresses=${contractAddress}`, {
      headers: { 'X-API-Key': MORALIS_API_KEY }
    });
    const token = data[0];
    if (!token) return null;
    return {
      name: token.name,
      symbol: token.symbol,
      price: token.usdPrice || 0,
      logo: token.logo || '',
    };
  } catch (error) {
    console.log(`⚠️ Moralis failed for ${contractAddress}: ${error.response?.status}`);
    return null;
  }
}

async function fetchFromCoinApi(contractAddress) {
  try {
    const { data } = await axios.get(`https://rest.coinapi.io/v1/assets`, {
      headers: { 'X-CoinAPI-Key': COINAPI_KEY }
    });
    const token = data.find(asset => asset.asset_id.toLowerCase() === contractAddress.toLowerCase());
    if (!token) return null;
    return {
      name: token.name,
      symbol: token.asset_id,
      price: token.price_usd || 0,
      logo: '',
    };
  } catch (error) {
    console.log(`⚠️ CoinAPI failed for ${contractAddress}: ${error.response?.status}`);
    return null;
  }
}

async function enrichNewCoin(contractAddress, network = 'bsc') {
  console.log(`🔄 Enriching token: ${contractAddress} on network: ${network}`);

  const sources = [
    fetchFromCoinGecko,
    fetchFromCoinCap,
    fetchFromMoralis,
    fetchFromCoinApi,
  ];

  for (const source of sources) {
    const details = await source(contractAddress, network);
    if (details && details.name && details.symbol) {
      const newCoin = new Coin({
        contractAddress: contractAddress.toLowerCase(),
        name: details.name,
        symbol: details.symbol,
        price: details.price,
        logo: details.logo,
        network,
        createdAt: new Date(),
      });

      await newCoin.save();
      console.log(`✅ Coin saved: ${details.symbol} (${contractAddress})`);
      return;
    } else {
      await sleep(1500); // wait 1.5 sec to avoid rate limit
    }
  }

  console.log(`❌ No valid details found for token: ${contractAddress}, skipping...`);
}

module.exports = { enrichNewCoin };
