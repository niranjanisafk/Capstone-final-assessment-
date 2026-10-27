import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const ExpenseList = ({ expenses, onEdit, onDeleteClick }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <h3>No expenses recorded yet</h3>
          <p>Start tracking your expenses using the form on the left!</p>
        </div>
      </div>
    );
  }

  const getCategoryClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'food':
        return 'category-food';
      case 'travel':
        return 'category-travel';
      case 'bills':
        return 'category-bills';
      case 'shopping':
        return 'category-shopping';
      default:
        return 'category-other';
    }
  };

  const getCategoryEmoji = (category) => {
    switch (category?.toLowerCase()) {
      case 'food':
        return '🍔';
      case 'travel':
        return '✈️';
      case 'bills':
        return '💡';
      case 'shopping':
        return '🛍️';
      default:
        return '📦';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card">
      <h3 className="card-title">📋 Expense Records ({expenses.length})</h3>
      <div className="table-responsive">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>
                  <strong>{expense.title}</strong>
                </td>
                <td>
                  <span className={`category-badge ${getCategoryClass(expense.category)}`}>
                    <span>{getCategoryEmoji(expense.category)}</span>
                    {expense.category}
                  </span>
                </td>
                <td>{formatDate(expense.date)}</td>
                <td className="expense-amount">
                  ${parseFloat(expense.amount).toFixed(2)}
                </td>
                <td>
                  <div className="actions-cell" style={{ justifyContent: 'center' }}>
                    <button
                      className="action-btn edit-btn"
                      title="Edit Expense"
                      onClick={() => onEdit(expense)}
                    >
                      <Edit2 size={15} /> Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      title="Delete Expense"
                      onClick={() => onDeleteClick(expense)}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
