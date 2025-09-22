import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo credentials validation
    if (credentials.username === 'operator' && credentials.password === 'incineration') {
      try {
        // Store authentication state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'operator');
        localStorage.setItem('loginTime', new Date().toISOString());
        
        // Force a page reload to ensure authentication state is properly set
        window.location.href = '/';
      } catch (error) {
        console.error('Login error:', error);
        setError('Login failed. Please try again.');
      }
    } else {
      setError('Invalid username or password. Please try again.');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = () => {
    setCredentials({
      username: 'operator',
      password: 'incineration'
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/Eco.png" alt="EcoGrid Logo" className="login-logo" />
          <h1>Waste Incineration System</h1>
          <p className="login-subtitle">Operator Login Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <button 
            type="button" 
            className="demo-button"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Fill Demo Credentials
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Username:</strong> operator</p>
            <p><strong>Password:</strong> incineration</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
