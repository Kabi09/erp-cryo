const express = require('express');
const router = express.Router();
const {
  getEstimations,
  getEstimationById,
  createEstimation,
  updateEstimation,
  reviewEstimation
} = require('../controllers/estimationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getEstimations)
  .post(createEstimation);

router.route('/:id')
  .get(getEstimationById)
  .put(updateEstimation);

router.patch('/:id/review', authorize('Super Admin', 'Engineering Manager', 'Sales Manager', 'MD / Director'), reviewEstimation);

module.exports = router;
