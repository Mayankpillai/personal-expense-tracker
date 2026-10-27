const Transaction = require('../models/Transaction');

// @desc    Get all transactions (with optional filters)
// @route   GET /api/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search } = req.query;

    const query = {};

    // Filter by transaction type (income / expense)
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day to include all records on endDate
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Keyword search in note or category
    if (search && search.trim() !== '') {
      query.$or = [
        { note: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Retrieve transactions sorted by newest first
    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, note } = req.body;

    // Validate required fields
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Valid transaction type (income or expense) is required' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number greater than 0' });
    }

    if (!category || category.trim() === '') {
      return res.status(400).json({ error: 'Category is required' });
    }

    const transactionDate = date ? new Date(date) : new Date();
    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({ error: 'A valid date is required' });
    }

    const transaction = await Transaction.create({
      type,
      amount: numericAmount,
      category: category.trim(),
      date: transactionDate,
      note: note ? note.trim() : ''
    });

    return res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, note } = req.body;

    // Find existing transaction
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Validate if fields are provided
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Type must be either income or expense' });
      }
      transaction.type = type;
    }

    if (amount !== undefined) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number greater than 0' });
      }
      transaction.amount = numericAmount;
    }

    if (category !== undefined) {
      if (category.trim() === '') {
        return res.status(400).json({ error: 'Category cannot be empty' });
      }
      transaction.category = category.trim();
    }

    if (date !== undefined) {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ error: 'A valid date is required' });
      }
      transaction.date = newDate;
    }

    if (note !== undefined) {
      transaction.note = note.trim();
    }

    const updatedTransaction = await transaction.save();
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.deleteOne();
    return res.status(200).json({ message: 'Transaction removed successfully' });
  } catch (error) {
    next(error);
  }
};
