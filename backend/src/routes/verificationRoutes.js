const express = require('express');
const router = express.Router();
const {
  getVerificationsByLead,
  getVerificationById,
  createVerification,
  requestAmendment
} = require('../controllers/verificationController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.post('/', createVerification);
router.get('/lead/:leadId', getVerificationsByLead);
router.get('/:id', getVerificationById);
router.post('/:id/request-amendment', requestAmendment);

module.exports = router;

