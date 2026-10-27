const Transaction = require('../models/Transaction');

// Helper to build date filter for aggregation or queries
const getDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }
  return filter;
};

// @desc    Get summary totals: totalIncome, totalExpense, balance
// @route   GET /api/analytics/summary
exports.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const matchFilter = getDateFilter(startDate, endDate);

    const summary = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let transactionCount = 0;

    summary.forEach(item => {
      transactionCount += item.count;
      if (item._id === 'income') {
        totalIncome = item.total;
      } else if (item._id === 'expense') {
        totalExpense = item.total;
      }
    });

    const balance = totalIncome - totalExpense;

    return res.status(200).json({
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      transactionCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense breakdown grouped by category
// @route   GET /api/analytics/categories
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const matchFilter = {
      type: 'expense',
      ...getDateFilter(startDate, endDate)
    };

    const categories = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1
        }
      }
    ]);

    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly comparison for income vs expense
// @route   GET /api/analytics/monthly
exports.getMonthlyComparison = async (req, res, next) => {
  try {
    const monthlyData = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Format into chart-friendly array with month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = {};

    monthlyData.forEach(item => {
      const year = item._id.year;
      const month = item._id.month;
      const key = `${year}-${String(month).padStart(2, '0')}`;

      if (!map[key]) {
        map[key] = {
          period: key,
          label: `${monthNames[month - 1]} ${year}`,
          income: 0,
          expense: 0
        };
      }

      if (item._id.type === 'income') {
        map[key].income = Number(item.total.toFixed(2));
      } else if (item._id.type === 'expense') {
        map[key].expense = Number(item.total.toFixed(2));
      }
    });

    const result = Object.values(map);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get day-wise expenses for a selected month (supports viewing previous months)
// @route   GET /api/analytics/daily?month=YYYY-MM
exports.getDailyExpenses = async (req, res, next) => {
  try {
    const now = new Date();
    let { month } = req.query; // format: 'YYYY-MM'

    // Default to current year & month if not provided
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);
    const monthIndex = monthNum - 1;

    const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthLabel = `${monthNames[monthIndex]} ${year}`;

    // Aggregate expenses grouped by day of the month
    const dailyAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const dayMap = {};
    let totalExpense = 0;
    dailyAgg.forEach(item => {
      dayMap[item._id] = item.total;
      totalExpense += item.total;
    });

    const days = [];
    for (let d = 1; d <= totalDays; d++) {
      const amt = dayMap[d] ? Number(dayMap[d].toFixed(2)) : 0;
      days.push({
        day: d,
        label: `Day ${d}`,
        amount: amt
      });
    }

    // Get all distinct months with expense transactions to populate month selector
    const monthsAgg = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      }
    ]);

    const availableMonths = monthsAgg.map(m => {
      const y = m._id.year;
      const mo = m._id.month;
      const periodKey = `${y}-${String(mo).padStart(2, '0')}`;
      return {
        period: periodKey,
        label: `${monthNames[mo - 1]} ${y}`
      };
    });

    // If current selected month is not in availableMonths, add it
    if (!availableMonths.some(m => m.period === month)) {
      availableMonths.unshift({
        period: month,
        label: monthLabel
      });
    }

    return res.status(200).json({
      selectedMonth: month,
      monthLabel,
      totalExpense: Number(totalExpense.toFixed(2)),
      availableMonths,
      days
    });
  } catch (error) {
    next(error);
  }
};
