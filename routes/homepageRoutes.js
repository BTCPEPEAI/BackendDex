const express = require('express');
const router = express.Router();
const {
  getHomepageBox,
  updateHomepageBox,
  getPumpFunData
} = require('../controllers/homepageController');
const { verifyAdmin } = require('../middleware/auth');

// Public
router.get('/box/:type', getHomepageBox);         // GET /api/homepage/box/trending
router.get('/pumpfun', getPumpFunData);           // GET /api/homepage/pumpfun
router.post('/box/update', verifyAdmin, updateHomepageBox);

// Admin
router.post('/box/update', updateHomepageBox);    // POST /api/homepage/box/update

module.exports = router;
