const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/metrics', getDashboardMetrics);

module.exports = router;

