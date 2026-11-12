const express = require('express');
const router = express.Router();
const {
  getPIs,
  getPIById,
  createPI,
  approvePI,
  downloadPIPdf
} = require('../controllers/piController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPIs)
  .post(createPI);

router.route('/:id')
  .get(getPIById);

router.patch('/:id/approve', authorize('Super Admin', 'Accounts Manager', 'Sales Manager', 'MD / Director'), approvePI);
router.get('/:id/pdf', downloadPIPdf);

module.exports = router;
