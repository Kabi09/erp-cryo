const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, getAllUsers, createUser, updateUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// User Management (Admin / HR)
router.get('/users', protect, getAllUsers);
router.post('/users', protect, authorize('Super Admin', 'MD / Director'), createUser);
router.put('/users/:id', protect, authorize('Super Admin', 'MD / Director'), updateUser);

module.exports = router;
