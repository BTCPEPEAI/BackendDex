const express = require('express');
const router = express.Router();
const { fetchDexData } = require('../controllers/dexController');

router.get('/:contract', fetchDexData); // GET /api/dex-data/:contract?network=solana

module.exports = router;
