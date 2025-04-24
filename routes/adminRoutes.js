const express = require('express');
const router = express.Router();
const { login, setCategoryCoins } = require('../controllers/adminController');
const { verifyAdmin } = require('../middlewares/authMiddleware');
const { setAdminCategory } = require('../controllers/adminController');
const {
    registerAdmin,
    loginAdmin
  } = require('../controllers/adminController');
  const adminController = require('../controllers/adminController');
  const auth = require('../middlewares/auth');

  
router.post('/set-category', setAdminCategory);
router.post('/login', login);
router.post('/set-category', verifyAdmin, setCategoryCoins);
router.post('/register', registerAdmin); // Only use ONCE to create first admin
router.post('/login', loginAdmin);       // POST /api/admin/login
// Protected routes
router.get('/dashboard', auth, adminController.getDashboardStats);
router.get('/applications', auth, adminController.listApplications);
router.put('/applications/:id', auth, adminController.updateApplicationStatus);


module.exports = router;
