const express = require('express');
const router = express.Router();
const {
  getNegotiations,
  createNegotiation,
  reviewNegotiation
} = require('../controllers/negotiationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNegotiations)
  .post(createNegotiation);

router.patch('/:id/review', authorize('Super Admin', 'Sales Manager', 'MD / Director'), reviewNegotiation);

module.exports = router;
