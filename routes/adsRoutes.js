const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');

// Public route for frontend
router.get('/page-position', adsController.getAdsForPagePosition);

// Admin routes (later protect with admin auth middleware)
router.post('/', adsController.createAd);
router.put('/:id', adsController.updateAd);
router.delete('/:id', adsController.deleteAd);

module.exports = router;
