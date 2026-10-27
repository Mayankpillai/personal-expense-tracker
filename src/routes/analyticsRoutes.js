const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyComparison
} = require('../controllers/analyticsController');

// Routes for /api/analytics
router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/monthly', getMonthlyComparison);

module.exports = router;
