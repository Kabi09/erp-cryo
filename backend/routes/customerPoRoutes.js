const express = require('express');
const router = express.Router();
const {
  getCustomerPOs,
  getCustomerPOById,
  createCustomerPO,
  verifyCustomerPO
} = require('../controllers/customerPoController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCustomerPOs)
  .post(createCustomerPO);

router.route('/:id')
  .get(getCustomerPOById);

router.patch('/:id/verify', authorize('Super Admin', 'Sales Manager', 'Accounts Manager', 'Engineering Manager', 'MD / Director'), verifyCustomerPO);

module.exports = router;
