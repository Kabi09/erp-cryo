const express = require('express');
const router = express.Router();
const {
  getQuotations,
  getQuotationById,
  createQuotation,
  createRevision,
  addFeedback,
  markWon,
  markLost,
  downloadQuotationPDF
} = require('../controllers/quotationController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getQuotations)
  .post(createQuotation);

router.route('/:id')
  .get(getQuotationById);

router.post('/:id/revise', createRevision);
router.post('/:id/feedback', addFeedback);
router.post('/:id/mark-won', markWon);
router.post('/:id/mark-lost', markLost);
router.get('/:id/pdf', downloadQuotationPDF);

module.exports = router;

