const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');
const AdminCoin = require('../models/AdminCoin');
const secret = process.env.JWT_SECRET || 'your_secret_key';
const Application = require('../models/Application');

// Admin login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  const admin = await AdminUser.findOne({ username });

  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};

// Add or update category coins (protected route)
exports.setCategoryCoins = async (req, res) => {
  const { category, coins } = req.body; // coins = array of contract addresses

  let entry = await AdminCoin.findOne({ category });
  if (entry) {
    entry.coins = coins;
    await entry.save();
  } else {
    entry = await AdminCoin.create({ category, coins });
  }

  res.json({ success: true, category, coins });
};


// Admin sets coins for a category
exports.setAdminCategory = async (req, res) => {
  const { category, coins } = req.body;

  let record = await AdminCoin.findOne({ category });
  if (!record) {
    record = await AdminCoin.create({ category, coins });
  } else {
    record.coins = coins;
    await record.save();
  }

  res.json({ success: true, category: record.category, coins: record.coins });
};

exports.registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = new AdminUser({ email, passwordHash });

  try {
    await admin.save();
    res.json({ message: 'Admin created' });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await AdminUser.findOne({ email });
  if (!admin || !(await admin.validatePassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id, email: admin.email }, secret, {
    expiresIn: '7d'
  });

  res.json({ token });
};

const getDashboardStats = async (req, res) => {
  const totalApps = await Application.countDocuments();
  const pending = await Application.countDocuments({ status: 'pending' });
  res.json({ totalApps, pending });
};

const listApplications = async (req, res) => {
  const apps = await Application.find().sort({ requestedAt: -1 });
  res.json(apps);
};

const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await Application.findByIdAndUpdate(id, {
    status,
    reviewedAt: new Date()
  }, { new: true });

  res.json(updated);
};

module.exports = {
  getDashboardStats,
  listApplications,
  updateApplicationStatus
};
