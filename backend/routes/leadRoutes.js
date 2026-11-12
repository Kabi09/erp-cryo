const express = require('express');
const router = express.Router();
const { getLeads, createOrUpdateLeadDecision } = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createOrUpdateLeadDecision);

module.exports = router;
