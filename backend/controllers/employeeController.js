const { validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { isSuperAdmin, isDepartmentAdmin } = require('../utils/roles');

/**
 * GET /api/employees
 * superadmin → all employees
 * dept admin → employees in own department
 * serviceperson → denied
 */
const getEmployees = async (req, res, next) => {
  try {
    const { role, department } = req.user;
    let filter = {};

    if (isSuperAdmin(role)) {
      // No filter – see everyone
    } else if (isDepartmentAdmin(role)) {
      filter.department = department;
    } else {
      throw ApiError.forbidden('You do not have permission to view employees.');
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    return ApiResponse.success(res, 200, 'Employees retrieved successfully', employees);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employees/me
 * Any authenticated user can view their own profile.
 */
const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      throw ApiError.notFound('Employee not found.');
    }
    return ApiResponse.success(res, 200, 'Profile retrieved successfully', employee);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employees/:id
 * superadmin → any
 * dept admin → same department only
 * serviceperson → own id only
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { role, department, id: userId } = req.user;
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      throw ApiError.notFound('Employee not found.');
    }

    if (isSuperAdmin(role)) {
      // allowed
    } else if (isDepartmentAdmin(role)) {
      if (employee.department !== department) {
        throw ApiError.forbidden('You can only view employees in your department.');
      }
    } else {
      // serviceperson or other – own id only
      if (id !== userId) {
        throw ApiError.forbidden('You can only view your own profile.');
      }
    }

    return ApiResponse.success(res, 200, 'Employee retrieved successfully', employee);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/employees
 * superadmin → any department
 * dept admin → own department only
 */
const createEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest('Validation failed', errors.array());
    }

    const { role, department } = req.user;
    const { name, email, phone, password, role: newRole, department: newDept } = req.body;

    // Dept admin can only create in own department
    if (!isSuperAdmin(role)) {
      if (newDept && newDept !== department) {
        throw ApiError.forbidden('You can only create employees in your department.');
      }
      // Cannot create a superadmin
      if (newRole === 'superadmin') {
        throw ApiError.forbidden('Only superadmin can assign the superadmin role.');
      }
    }

    // Check duplicate email
    const existing = await Employee.findOne({ email });
    if (existing) {
      throw ApiError.conflict('An employee with this email already exists.');
    }

    const employee = await Employee.create({
      name,
      email,
      phone: phone || '',
      password,
      role: newRole,
      department: isSuperAdmin(role) ? newDept : department,
    });

    return ApiResponse.success(res, 201, 'Employee created successfully', employee);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/employees/:id
 * superadmin → any
 * dept admin → own department only; cannot promote to superadmin
 */
const updateEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest('Validation failed', errors.array());
    }

    const { role, department } = req.user;
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      throw ApiError.notFound('Employee not found.');
    }

    // Scoping checks
    if (!isSuperAdmin(role)) {
      if (employee.department !== department) {
        throw ApiError.forbidden('You can only update employees in your department.');
      }
      // Cannot change role to superadmin
      if (req.body.role === 'superadmin') {
        throw ApiError.forbidden('Only superadmin can assign the superadmin role.');
      }
      // Cannot change department to a different one
      if (req.body.department && req.body.department !== department) {
        throw ApiError.forbidden('You can only manage employees in your department.');
      }
    }

    // Allowed update fields
    const allowedFields = ['name', 'email', 'phone', 'role', 'department'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If password is provided, hash it
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return ApiResponse.success(res, 200, 'Employee updated successfully', updatedEmployee);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/employees/:id/toggle-active
 * superadmin → any; dept admin → own department only
 * Cannot deactivate yourself.
 */
const toggleActive = async (req, res, next) => {
  try {
    const { role, department, id: userId } = req.user;
    const { id } = req.params;

    if (id === userId) {
      throw ApiError.badRequest('You cannot deactivate your own account.');
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      throw ApiError.notFound('Employee not found.');
    }

    // Scoping checks
    if (!isSuperAdmin(role)) {
      if (employee.department !== department) {
        throw ApiError.forbidden('You can only manage employees in your department.');
      }
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    const status = employee.isActive ? 'activated' : 'deactivated';
    return ApiResponse.success(res, 200, `Employee ${status} successfully`, employee);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getMyProfile,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleActive,
};
