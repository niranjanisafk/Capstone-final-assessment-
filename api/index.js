const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const expenseRoutes = require('../backend/routes/expenses');
const authRoutes = require('../backend/routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api', (req, res) => {
  res.json({ status: 'Online', message: 'Personal Expense Tracker Serverless API on Vercel' });
});

// Lazy MongoDB connect for serverless
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    isConnected = true;
  } catch (err) {
    console.warn('Vercel serverless DB notice:', err.message);
  }
};

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
