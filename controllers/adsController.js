const Ad = require('../models/Ad');

// Public: Get ads for page and position
async function getAdsForPagePosition(req, res) {
  try {
    const { page, position, network } = req.query;

    if (!page || !position) {
      return res.status(400).json({ error: 'Page and Position are required' });
    }

    const now = new Date();

    const ads = await Ad.find({
      page,
      position,
      network: network || 'eth',
      active: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: now } }
      ]
    }).sort({ createdAt: -1 });

    res.json(ads);
  } catch (err) {
    console.error('Error fetching ads:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Admin: Create ad
async function createAd(req, res) {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.json({ message: 'Ad created successfully', ad });
  } catch (err) {
    console.error('Error creating ad:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Admin: Update ad
async function updateAd(req, res) {
  try {
    const adId = req.params.id;
    const ad = await Ad.findByIdAndUpdate(adId, req.body, { new: true });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });

    res.json({ message: 'Ad updated successfully', ad });
  } catch (err) {
    console.error('Error updating ad:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Admin: Delete ad
async function deleteAd(req, res) {
  try {
    const adId = req.params.id;
    const ad = await Ad.findByIdAndDelete(adId);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });

    res.json({ message: 'Ad deleted successfully' });
  } catch (err) {
    console.error('Error deleting ad:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getAdsForPagePosition,
  createAd,
  updateAd,
  deleteAd
};
