import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, LogIn, Sparkles } from 'lucide-react';

const AuthModal = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_AUTH_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/expenses')
    .replace('/expenses', '/auth');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const endpoint = isLogin ? `${API_AUTH_URL}/login` : `${API_AUTH_URL}/register`;
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('expense_tracker_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        setError(data.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      // Fallback local signin if server is offline
      const mockUser = {
        id: 'usr_' + Date.now(),
        name: name || email.split('@')[0],
        email: email
      };
      localStorage.setItem('expense_tracker_user', JSON.stringify(mockUser));
      onAuthSuccess(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest_user',
      name: 'Guest User',
      email: 'guest@expensetracker.local'
    };
    localStorage.setItem('expense_tracker_user', JSON.stringify(guestUser));
    onAuthSuccess(guestUser);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles size={18} />
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          <p>
            {isLogin
              ? 'Sign in to access your personal expenses & budget tracker'
              : 'Join to start tracking and organizing your daily expenses'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ padding: '10px 14px', fontSize: '0.875rem' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? (
              'Processing...'
            ) : isLogin ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Create Account
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '8px' }}
            onClick={handleGuestLogin}
          >
            ⚡ Quick Demo / Guest Access
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="toggle-auth-btn"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="toggle-auth-btn"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
