const express = require('express');
const router = express.Router();

const {
  getHomepageBox,
  updateHomepageBox,
  getPumpFunData,
} = require('../controllers/homepageController');

const { verifyAdmin } = require('../middleware/auth'); // ✅ FIXED: was incorrect path 'middlewares/auth'

/**
 * Public Routes
 */
router.get('/box/:type', getHomepageBox);         // GET /api/homepage/box/trending
router.get('/pumpfun', getPumpFunData);           // GET /api/homepage/pumpfun

/**
 * Admin Route
 */
router.post('/box/update', verifyAdmin, updateHomepageBox); // POST /api/homepage/box/update

module.exports = router;
