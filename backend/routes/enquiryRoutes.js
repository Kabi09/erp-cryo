const express = require('express');
const router = express.Router();
const {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getEnquiries)
  .post(createEnquiry);

router.route('/:id')
  .get(getEnquiryById)
  .put(updateEnquiry)
  .delete(deleteEnquiry);

router.patch('/:id/status', updateEnquiryStatus);

module.exports = router;
