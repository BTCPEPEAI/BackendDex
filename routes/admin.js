const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Application = require('../models/Application');

// GET dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.json({
      totalUsers,
      totalApplications,
      revenue: 0, // placeholder for future
      activeUsers: 0, // can be tracked later
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
});

module.exports = router;
