const express = require('express');
const router = express.Router();
const { getCoinInfo } = require('../controllers/indexerController');

router.get('/coin-info', getCoinInfo);

module.exports = router;
