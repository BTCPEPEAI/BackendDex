const express = require('express');
const router = express.Router();

const {
  getHomepageBox,
  updateHomepageBox,
  getPumpFunData
} = require('../controllers/homepageController');

const auth = require('../middlewares/auth');

// Routes
router.get('/box/:type', getHomepageBox);        // Public: GET /api/homepage/box/trending
router.post('/box/update', auth, updateHomepageBox);  // Admin only
router.get('/pumpfun', getPumpFunData);          // Public: GET /api/homepage/pumpfun

module.exports = router;
