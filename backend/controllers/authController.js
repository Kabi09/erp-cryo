const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const config = require('../config');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest('Validation failed', errors.array());
    }

    const { email, password } = req.body;

    // Find user with password included
    const employee = await Employee.findOne({ email }).select('+password');

    if (!employee) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!employee.isActive) {
      throw ApiError.unauthorized('Account has been deactivated.');
    }

    // Compare password
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // Generate JWT
    const payload = {
      id: employee._id,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return ApiResponse.success(res, 200, 'Login successful', {
      token,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
