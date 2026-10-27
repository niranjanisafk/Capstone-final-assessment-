const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for fallback / mock mode when Atlas cluster is offline
let expenses = [
  {
    _id: '1',
    title: 'Team Lunch',
    amount: 32.50,
    category: 'Food',
    date: new Date('2026-10-25T12:30:00.000Z')
  },
  {
    _id: '2',
    title: 'Monthly Electric Bill',
    amount: 85.00,
    category: 'Bills',
    date: new Date('2026-10-24T09:00:00.000Z')
  },
  {
    _id: '3',
    title: 'Metro Pass Recharge',
    amount: 45.00,
    category: 'Travel',
    date: new Date('2026-10-23T08:15:00.000Z')
  }
];

// Helper to sort expenses
const getSortedExpenses = () => {
  return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
};

// GET /api/expenses
app.get('/api/expenses', (req, res) => {
  res.json({ success: true, count: expenses.length, data: getSortedExpenses() });
});

// GET /api/expenses/:id
app.get('/api/expenses/:id', (req, res) => {
  const expense = expenses.find((e) => e._id === req.params.id);
  if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
  res.json({ success: true, data: expense });
});

// POST /api/expenses
app.post('/api/expenses', (req, res) => {
  const { title, amount, category, date } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
  }
  const validCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];
  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
  }

  const newExpense = {
    _id: Date.now().toString(),
    title: title.trim(),
    amount: parsedAmount,
    category,
    date: new Date(date || Date.now())
  };
  expenses.unshift(newExpense);
  res.status(201).json({ success: true, message: 'Expense added successfully', data: newExpense });
});

// PUT /api/expenses/:id
app.put('/api/expenses/:id', (req, res) => {
  const index = expenses.findIndex((e) => e._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }
  const { title, amount, category, date } = req.body;
  if (title !== undefined && !title.trim()) {
    return res.status(400).json({ success: false, message: 'Title cannot be empty' });
  }
  if (amount !== undefined) {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }
  }

  expenses[index] = {
    ...expenses[index],
    ...(title !== undefined && { title: title.trim() }),
    ...(amount !== undefined && { amount: parseFloat(amount) }),
    ...(category !== undefined && { category }),
    ...(date !== undefined && { date: new Date(date) })
  };

  res.json({ success: true, message: 'Expense updated successfully', data: expenses[index] });
});

// DELETE /api/expenses/:id
app.delete('/api/expenses/:id', (req, res) => {
  const index = expenses.findIndex((e) => e._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }
  const removed = expenses.splice(index, 1)[0];
  res.json({ success: true, message: 'Expense deleted successfully', data: removed });
});

module.exports = app;
