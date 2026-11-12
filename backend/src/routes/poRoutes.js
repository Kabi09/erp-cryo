const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPOById,
  createPurchaseOrder,
  amendPurchaseOrder
} = require('../controllers/poController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);

router.route('/')
  .get(getPurchaseOrders)
  .post(upload.single('poDocument'), createPurchaseOrder);

router.route('/:id')
  .get(getPOById);

router.post('/:id/amendment', upload.single('poDocument'), amendPurchaseOrder);

module.exports = router;

