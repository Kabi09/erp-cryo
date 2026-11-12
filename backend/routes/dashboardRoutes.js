const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getDashboardCharts,
  getDashboardActivities
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/charts', getDashboardCharts);
router.get('/activities', getDashboardActivities);

module.exports = router;
