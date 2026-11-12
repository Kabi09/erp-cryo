const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  qualifyLead,
  getLeadActivities,
  addLeadActivity
} = require('../controllers/leadController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead);

router.put('/:id/qualify', qualifyLead);
router.route('/:id/activities')
  .get(getLeadActivities)
  .post(addLeadActivity);

module.exports = router;

