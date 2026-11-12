const express = require('express');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const {
  getEmployees,
  getMyProfile,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleActive,
} = require('../controllers/employeeController');
const { ALL_ROLES, ALL_DEPARTMENTS } = require('../utils/roles');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/employees/me — own profile (must be before /:id)
router.get('/me', getMyProfile);

// GET /api/employees — list employees
router.get(
  '/',
  authorize(PERMISSIONS.EMPLOYEE_VIEW_ALL, PERMISSIONS.EMPLOYEE_VIEW_DEPT),
  getEmployees
);

// GET /api/employees/:id
router.get(
  '/:id',
  authorize(
    PERMISSIONS.EMPLOYEE_VIEW_ALL,
    PERMISSIONS.EMPLOYEE_VIEW_DEPT,
    PERMISSIONS.EMPLOYEE_VIEW_SELF
  ),
  getEmployeeById
);

// POST /api/employees — create employee
router.post(
  '/',
  authorize(PERMISSIONS.EMPLOYEE_VIEW_ALL, PERMISSIONS.EMPLOYEE_CREATE),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(ALL_ROLES)
      .withMessage('Invalid role'),
    body('department')
      .notEmpty()
      .withMessage('Department is required')
      .isIn(ALL_DEPARTMENTS)
      .withMessage('Invalid department'),
    body('phone').optional().trim(),
  ],
  createEmployee
);

// PUT /api/employees/:id — update employee
router.put(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEE_VIEW_ALL, PERMISSIONS.EMPLOYEE_EDIT),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(ALL_ROLES)
      .withMessage('Invalid role'),
    body('department')
      .optional()
      .isIn(ALL_DEPARTMENTS)
      .withMessage('Invalid department'),
    body('phone').optional().trim(),
  ],
  updateEmployee
);

// PATCH /api/employees/:id/toggle-active
router.patch(
  '/:id/toggle-active',
  authorize(PERMISSIONS.EMPLOYEE_VIEW_ALL, PERMISSIONS.EMPLOYEE_DEACTIVATE),
  toggleActive
);

module.exports = router;
