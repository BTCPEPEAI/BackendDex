const express = require('express');
const router = express.Router();
const User = require('@/models/User');

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// Block/unblock a user
router.put('/:id/toggle-block', async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ message: 'User block status updated', user });
});

module.exports = router;
