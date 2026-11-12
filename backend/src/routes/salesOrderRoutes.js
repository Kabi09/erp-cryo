const express = require('express');
const router = express.Router();
const {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  handoverToProduction
} = require('../controllers/salesOrderController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getSalesOrders)
  .post(createSalesOrder);

router.route('/:id')
  .get(getSalesOrderById);

router.put('/:id/handover', handoverToProduction);

module.exports = router;

