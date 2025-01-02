const Student = require('../models/users');

const updateAccount = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    updates.forEach(update => student[update] = req.body[update]);
    await student.save();

    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  updateAccount
}