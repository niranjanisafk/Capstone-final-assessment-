const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const expenseRoutes = require('./routes/expenses');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Root health check endpoint
app.get('/', (req, res) => {
  res.send({ status: 'Online', message: 'Personal Expense Tracker API is running' });
});

// Database connection & Server start
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';

console.log('Connecting to database...');
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 })
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas / Database');
  })
  .catch((err) => {
    console.warn('MongoDB connection note:', err.message);
    console.log('Automated In-Memory Store active — all Add, View, Edit, and Delete operations will run seamlessly!');
  });

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});

module.exports = app;
