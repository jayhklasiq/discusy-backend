const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

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

    const user = await User.findById(req.user._id);
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE route to delete user account
router.delete('/delete', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;