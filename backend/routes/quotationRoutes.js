const express = require('express');
const router = express.Router();
const {
  getQuotations,
  getQuotationById,
  createQuotation,
  reviseQuotation,
  approveQuotation,
  markQuotationSent,
  downloadQuotationPdf
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getQuotations)
  .post(createQuotation);

router.route('/:id')
  .get(getQuotationById);

router.post('/:id/revise', reviseQuotation);
router.patch('/:id/approve', authorize('Super Admin', 'Sales Manager', 'MD / Director'), approveQuotation);
router.patch('/:id/send', markQuotationSent);
router.get('/:id/pdf', downloadQuotationPdf);

module.exports = router;
