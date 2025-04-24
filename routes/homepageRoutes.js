const express = require('express');
const router = express.Router();
const {
  getHomepageBox,
  updateHomepageBox,
  getPumpFunData
} = require('../controllers/homepageController');

const { verifyAdmin } = require('../middlewares/auth');

router.get('/box/:type', getHomepageBox);       // GET /api/homepage/box/trending
router.get('/pumpfun', getPumpFunData);         // GET /api/homepage/pumpfun
router.post('/box/update', verifyAdmin, updateHomepageBox);  // ✅ Fix here

module.exports = router;
