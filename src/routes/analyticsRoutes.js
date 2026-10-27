const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyComparison,
  getDailyExpenses
} = require('../controllers/analyticsController');

// Routes for /api/analytics
router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/monthly', getMonthlyComparison);
router.get('/daily', getDailyExpenses);

module.exports = router;
