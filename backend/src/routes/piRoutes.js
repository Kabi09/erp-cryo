const express = require('express');
const router = express.Router();
const {
  getProformaInvoices,
  getPIById,
  createPI,
  downloadPIPDF
} = require('../controllers/piController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getProformaInvoices)
  .post(createPI);

router.route('/:id')
  .get(getPIById);

router.get('/:id/pdf', downloadPIPDF);

module.exports = router;

