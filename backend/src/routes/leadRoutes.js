const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  qualifyLead,
  getLeadActivities,
  addLeadActivity,
  addFollowUp,
  updateFollowUp,
  deleteFollowUp
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

// Follow-up routes
router.route('/:id/follow-ups')
  .post(addFollowUp);

router.route('/:id/follow-ups/:followUpId')
  .put(updateFollowUp)
  .delete(deleteFollowUp);

module.exports = router;

