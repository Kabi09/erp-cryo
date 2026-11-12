const express = require('express');
const router = express.Router();
const {
  getPayments,
  createPayment,
  verifyPayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPayments)
  .post(createPayment);

// Restricted financial verification to Accounts
router.patch('/:id/verify', authorize('Super Admin', 'Accounts Manager', 'Accounts Executive', 'MD / Director'), verifyPayment);

module.exports = router;
