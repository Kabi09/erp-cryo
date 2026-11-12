const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  linkLead
} = require('../controllers/customerController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.post('/link-lead', linkLead);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer);

module.exports = router;

