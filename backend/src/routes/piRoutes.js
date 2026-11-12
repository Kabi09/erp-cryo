const express = require('express');
const router = express.Router();
const {
  getProformaInvoices,
  getPIById,
  createPI,
  downloadPIPDF,
  updatePIStatus,
  sharePI
} = require('../controllers/piController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getProformaInvoices)
  .post(createPI);

router.route('/:id')
  .get(getPIById);

router.put('/:id/status', updatePIStatus);
router.post('/:id/share', sharePI);
router.get('/:id/pdf', downloadPIPDF);

module.exports = router;

