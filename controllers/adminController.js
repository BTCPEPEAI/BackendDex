const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');
const AdminCoin = require('../models/AdminCoin');
const Application = require('../models/Application');

const secret = process.env.JWT_SECRET || 'your_secret_key';

// ✅ Register Admin (only once or via protected access later)
const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await AdminUser.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new AdminUser({ username, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// ✅ Admin login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await AdminUser.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, username: admin.username }, secret, { expiresIn: '7d' });

    res.json({ token });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: 'Login failed' });
  }
};

// ✅ Admin sets coins for a category (like Trending, Gainers, etc.)
const setAdminCategory = async (req, res) => {
  try {
    const { category, coins } = req.body;

    let record = await AdminCoin.findOne({ category });
    if (!record) {
      record = await AdminCoin.create({ category, coins });
    } else {
      record.coins = coins;
      await record.save();
    }

    res.json({ success: true, category: record.category, coins: record.coins });
  } catch (e) {
    console.error('Set Category Error:', e);
    res.status(500).json({ message: 'Category update failed' });
  }
};

// ✅ Same logic, just separate route support
const setCategoryCoins = async (req, res) => {
  try {
    const { category, coins } = req.body;

    let entry = await AdminCoin.findOne({ category });
    if (entry) {
      entry.coins = coins;
      await entry.save();
    } else {
      entry = await AdminCoin.create({ category, coins });
    }

    res.json({ success: true, category, coins });
  } catch (e) {
    console.error('Set Category Coins Error:', e);
    res.status(500).json({ message: 'Category save failed' });
  }
};

// ✅ Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalApps = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: 'pending' });
    res.json({ totalApps, pending });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// ✅ Application list
const listApplications = async (req, res) => {
  try {
    const apps = await Application.find().sort({ requestedAt: -1 });
    res.json(apps);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// ✅ Update application status (approve/reject)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Application.findByIdAndUpdate(
      id,
      {
        status,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// ✅ Export all
module.exports = {
  registerAdmin,
  loginAdmin,
  setAdminCategory,
  setCategoryCoins,
  getDashboardStats,
  listApplications,
  updateApplicationStatus,
};
