const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// In-memory fallback if MongoDB Atlas is not yet reachable or disconnected
let memoryExpenses = [
  {
    _id: 'exp_1',
    userId: 'default_user',
    title: 'Grocery Supermarket',
    amount: 42.50,
    category: 'Food',
    date: new Date('2026-10-25T10:00:00.000Z')
  },
  {
    _id: 'exp_2',
    userId: 'default_user',
    title: 'Electricity Utility Bill',
    amount: 78.00,
    category: 'Bills',
    date: new Date('2026-10-24T14:30:00.000Z')
  },
  {
    _id: 'exp_3',
    userId: 'default_user',
    title: 'Taxi & Metro Fare',
    amount: 18.50,
    category: 'Travel',
    date: new Date('2026-10-23T09:15:00.000Z')
  }
];

// Helper to filter and sort
const getMemoryExpensesForUser = (userId) => {
  return memoryExpenses
    .filter(e => !userId || e.userId === userId || e.userId === 'default_user')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

// @route   GET /api/expenses
// @desc    Get all expenses (for user or all)
router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  const filter = userId ? { $or: [{ userId }, { userId: 'default_user' }] } : {};

  try {
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    return res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    console.warn('MongoDB query failed, serving from memory store:', error.message);
    const fallbackList = getMemoryExpensesForUser(userId);
    return res.status(200).json({ success: true, count: fallbackList.length, data: fallbackList, fallback: true });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get single expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    return res.status(200).json({ success: true, data: expense });
  } catch (error) {
    const found = memoryExpenses.find(e => e._id === req.params.id);
    if (found) return res.status(200).json({ success: true, data: found });
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const userId = req.headers['x-user-id'] || req.body.userId || 'default_user';

    // Manual validations
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number greater than 0' });
    }

    const validCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    try {
      const expense = new Expense({
        userId,
        title: title.trim(),
        amount: parsedAmount,
        category,
        date: new Date(date)
      });

      const savedExpense = await expense.save();
      return res.status(201).json({ success: true, message: 'Expense added successfully', data: savedExpense });
    } catch (dbErr) {
      console.warn('MongoDB save failed, using memory store:', dbErr.message);
      const newMemoryExpense = {
        _id: 'exp_' + Date.now(),
        userId,
        title: title.trim(),
        amount: parsedAmount,
        category,
        date: new Date(date)
      };
      memoryExpenses.unshift(newMemoryExpense);
      return res.status(201).json({ success: true, message: 'Expense added successfully', data: newMemoryExpense });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update an existing expense
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title cannot be empty' });
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number greater than 0' });
      }
    }

    const validCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];
    if (category !== undefined && !validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title.trim();
    if (amount !== undefined) updatedData.amount = parseFloat(amount);
    if (category !== undefined) updatedData.category = category;
    if (date !== undefined) updatedData.date = new Date(date);

    try {
      const expense = await Expense.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true, runValidators: true }
      );

      if (expense) {
        return res.status(200).json({ success: true, message: 'Expense updated successfully', data: expense });
      }
    } catch (dbErr) {
      console.warn('MongoDB update failed, attempting memory store update:', dbErr.message);
    }

    // Memory store fallback
    const idx = memoryExpenses.findIndex(e => e._id === req.params.id);
    if (idx !== -1) {
      memoryExpenses[idx] = { ...memoryExpenses[idx], ...updatedData };
      return res.status(200).json({ success: true, message: 'Expense updated successfully', data: memoryExpenses[idx] });
    }

    return res.status(404).json({ success: false, message: 'Expense not found' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    try {
      const expense = await Expense.findByIdAndDelete(req.params.id);
      if (expense) {
        return res.status(200).json({ success: true, message: 'Expense deleted successfully', data: expense });
      }
    } catch (dbErr) {
      console.warn('MongoDB delete failed, attempting memory store deletion:', dbErr.message);
    }

    const idx = memoryExpenses.findIndex(e => e._id === req.params.id);
    if (idx !== -1) {
      const deleted = memoryExpenses.splice(idx, 1)[0];
      return res.status(200).json({ success: true, message: 'Expense deleted successfully', data: deleted });
    }

    return res.status(404).json({ success: false, message: 'Expense not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting expense', error: error.message });
  }
});

module.exports = router;
