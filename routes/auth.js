const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const router = express.Router();

// Middleware to check if user is logged in
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.redirect('/posts');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.redirect('/posts');
    req.user = user;
    next();
  });
};

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, userType } = req.body;
  try {
    const user = new User({ name, email, password, userType });
    await user.save();
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    user.refreshToken = refreshToken;
    await user.save();

    res.send({ accessToken, refreshToken });
  } catch (error) {
    console.error('Login error:', error); // Log the error
    res.status(500).send({ error: error.message });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken });
  if (!user) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, userData) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.send({ accessToken: newAccessToken });
  });
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Apply the middleware to routes that need protection
router.use(authenticateToken);

module.exports = router;