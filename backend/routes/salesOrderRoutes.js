const express = require('express');
const router = express.Router();
const {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateApprovalStage,
  releaseToProduction,
  downloadSOPdf
} = require('../controllers/salesOrderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSalesOrders)
  .post(createSalesOrder);

router.route('/:id')
  .get(getSalesOrderById);

router.patch('/:id/approve-stage', updateApprovalStage);
router.patch('/:id/release', authorize('Super Admin', 'Sales Manager', 'Production Manager', 'MD / Director'), releaseToProduction);
router.get('/:id/pdf', downloadSOPdf);

module.exports = router;
