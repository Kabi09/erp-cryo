const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(authorize('Super Admin', 'Engineering Manager', 'Estimation Engineer', 'Sales Manager'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('Super Admin', 'Engineering Manager', 'Estimation Engineer', 'Sales Manager'), updateProduct)
  .delete(authorize('Super Admin', 'Engineering Manager'), deleteProduct);

module.exports = router;
