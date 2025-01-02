const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/users');

const router = express.Router();

// PUT route to modify user account
router.put('/update', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE route to delete user account by email
router.delete('/delete/:email', auth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route to load user data by email
router.get('/email', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
