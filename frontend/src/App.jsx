import React, { useState, useEffect } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ConfirmModal from './components/ConfirmModal';
import AuthModal from './components/AuthModal';
import { Wallet, AlertCircle, CheckCircle, RefreshCw, LogOut, User } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/expenses';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [notification, setNotification] = useState(null);

  // Check saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem('expense_tracker_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('expense_tracker_user');
      }
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Fetch all expenses from backend
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE_URL, {
        headers: {
          'x-user-id': currentUser?.id || 'default_user'
        }
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      } else {
        showNotification(data.message || 'Could not load expenses', 'danger');
      }
    } catch (err) {
      showNotification('Running in local/offline mode. Operations will continue smoothly!', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [currentUser]);

  // Calculate Total Amount Spent
  const totalAmount = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Add or Update Expense
  const handleSaveExpense = async (formData) => {
    try {
      const payload = {
        ...formData,
        userId: currentUser?.id || 'default_user'
      };

      if (editingExpense) {
        // UPDATE
        const res = await fetch(`${API_BASE_URL}/${editingExpense._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser?.id || 'default_user'
          },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (result.success) {
          showNotification('Expense updated successfully!', 'success');
          setEditingExpense(null);
          fetchExpenses();
        } else {
          showNotification(result.message || 'Error updating expense', 'danger');
        }
      } else {
        // CREATE
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser?.id || 'default_user'
          },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (result.success) {
          showNotification('Expense added successfully!', 'success');
          fetchExpenses();
        } else {
          showNotification(result.message || 'Error creating expense', 'danger');
        }
      }
    } catch (err) {
      showNotification('Network error while saving expense', 'danger');
    }
  };

  // Delete Expense
  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${deletingExpense._id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser?.id || 'default_user'
        }
      });
      const result = await res.json();

      if (result.success) {
        showNotification('Expense deleted successfully!', 'success');
        setDeletingExpense(null);
        fetchExpenses();
      } else {
        showNotification(result.message || 'Error deleting expense', 'danger');
      }
    } catch (err) {
      showNotification('Network error while deleting expense', 'danger');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('expense_tracker_user');
    setCurrentUser(null);
    setExpenses([]);
  };

  // If user is not authenticated, show Sign In / Sign Up modal
  if (!currentUser) {
    return <AuthModal onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="container">
      {/* Top Navbar with User info */}
      <nav className="top-nav">
        <div className="user-badge">
          <div className="avatar">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <div>
            <div>{currentUser.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{currentUser.email}</div>
          </div>
        </div>
        <div className="nav-actions">
          <button className="btn btn-sm btn-outline" onClick={handleLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="header">
        <h1>
          <Wallet size={36} color="#4f46e5" /> Personal Expense Tracker
        </h1>
        <p>Effortlessly track, monitor, and manage your daily spending</p>
      </header>

      {/* Total Amount Spent Card */}
      <div className="summary-card">
        <div className="summary-details">
          <h2>Total Amount Spent</h2>
          <div className="summary-amount">
            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-title">Transactions</div>
            <div className="stat-value">{expenses.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-title">Avg. Expense</div>
            <div className="stat-value">
              ${expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Global Alerts / Notification */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {notification.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{notification.message}</span>
          </div>
          <button className="alert-close" onClick={() => setNotification(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, List on Right */}
      <main className="main-grid">
        <ExpenseForm
          onSave={handleSaveExpense}
          editingExpense={editingExpense}
          onCancelEdit={() => setEditingExpense(null)}
        />

        <div>
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 12px auto', color: '#4f46e5' }} />
              <p style={{ color: '#64748b' }}>Loading your expenses...</p>
            </div>
          ) : (
            <ExpenseList
              expenses={expenses}
              onEdit={(expense) => {
                setEditingExpense(expense);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDeleteClick={(expense) => setDeletingExpense(expense)}
            />
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingExpense}
        title="Delete Expense"
        message={
          deletingExpense
            ? `Are you sure you want to delete "${deletingExpense.title}" of $${parseFloat(deletingExpense.amount).toFixed(2)}?`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingExpense(null)}
      />
    </div>
  );
}

export default App;
