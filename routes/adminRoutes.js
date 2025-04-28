const express = require('express');
const router = express.Router();
const { cleanDatabase } = require('../jobs/cleaner');
const {
  registerAdmin,
  loginAdmin,
  setAdminCategory,
  setCategoryCoins,
  getDashboardStats,
  listApplications,
  updateApplicationStatus
} = require('../controllers/adminController');

const auth = require('../middlewares/auth'); // Middleware that verifies token

// ✅ Public routes
router.post('/register', registerAdmin);     // Only use ONCE to create the first admin
router.post('/login', loginAdmin);           // Admin login

// ✅ Protected admin routes
router.post('/set-category', auth, setAdminCategory);
router.put('/set-category', auth, setCategoryCoins);

router.get('/dashboard', auth, getDashboardStats);
router.get('/applications', auth, listApplications);
router.put('/applications/:id', auth, updateApplicationStatus);

router.post('/admin/clean-database', async (req, res) => {
  try {
    await cleanDatabase();
    res.json({ success: true, message: '🧹 Database cleaned successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
