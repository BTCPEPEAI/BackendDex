const express = require('express');
const router = express.Router();
const { fetchTokenInfo } = require('../controllers/tokenInfoController');

router.get('/:contract', fetchTokenInfo); // /api/token-info/:contract

module.exports = router;
