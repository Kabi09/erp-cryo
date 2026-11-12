const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/apiError');
const Employee = require('../models/Employee');

/**
 * Verify JWT token and attach user to req.
 */
const verifyToken = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    // Verify user still exists and is active
    const user = await Employee.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists.');
    }
    if (!user.isActive) {
      throw ApiError.unauthorized('Account has been deactivated.');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      department: user.department,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired.'));
    }
    next(error);
  }
};

module.exports = { verifyToken };
