const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if the user is already logged in (token exists)
  if (token) {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified; // Attach user info to the request
      return next(); // User is logged in, proceed to the next middleware/route
    } catch (error) {
      return res.status(401).send({ error: 'Invalid token' });
    }
  }

  // If no token, proceed to authenticate
  // Here you can implement your logic to authenticate the user if needed
  // For example, you might want to check for a refresh token or other credentials
  return res.status(401).send({ error: 'Access denied, please log in' });
};

module.exports = authMiddleware; 