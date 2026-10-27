import React, { useState, useEffect } from 'react';
import { PlusCircle, Check, X } from 'lucide-react';

const ExpenseForm = ({ onSave, editingExpense, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title || '');
      setAmount(editingExpense.amount || '');
      setCategory(editingExpense.category || 'Food');
      const formattedDate = editingExpense.date
        ? new Date(editingExpense.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setDate(formattedDate);
    } else {
      resetForm();
    }
  }, [editingExpense]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    // Field validations
    if (!title.trim()) {
      setLocalError('Please enter a title for the expense.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setLocalError('Amount must be a positive number greater than 0.');
      return;
    }

    if (!date) {
      setLocalError('Please select a valid date.');
      return;
    }

    onSave({
      title: title.trim(),
      amount: numericAmount,
      category,
      date
    });

    if (!editingExpense) {
      resetForm();
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">
        {editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}
      </h3>

      {localError && (
        <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
          <span>{localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            className="form-control"
            placeholder="e.g. Grocery shopping, Uber ride"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount ($) *</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            className="form-control"
            placeholder="e.g. 45.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Food">🍔 Food</option>
            <option value="Travel">✈️ Travel</option>
            <option value="Bills">💡 Bills</option>
            <option value="Shopping">🛍️ Shopping</option>
            <option value="Other">📦 Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            {editingExpense ? (
              <>
                <Check size={18} /> Update Expense
              </>
            ) : (
              <>
                <PlusCircle size={18} /> Add Expense
              </>
            )}
          </button>
          {editingExpense && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                resetForm();
                onCancelEdit();
              }}
            >
              <X size={18} /> Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
