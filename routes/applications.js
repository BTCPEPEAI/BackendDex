const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Get all applications
router.get('/', async (req, res) => {
  const apps = await Application.find().sort({ createdAt: -1 });
  res.json(apps);
});

// Submit a new application
router.post('/', async (req, res) => {
  const app = new Application(req.body);
  await app.save();
  res.json({ message: 'Application submitted', app });
});

// Update status (approve/reject)
router.put('/:id/status', async (req, res) => {
  const { status, note } = req.body;
  const app = await Application.findByIdAndUpdate(req.params.id, { status, note }, { new: true });
  res.json({ message: 'Application status updated', app });
});

module.exports = router;
