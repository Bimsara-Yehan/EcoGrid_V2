import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LogWaste from './components/LogWaste';
import Reports from './components/Reports';
import ExistingLogs from './components/ExistingLogs';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Main App Content Component
function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleNavClick = (path) => {
    console.log('Navigation clicked:', path);
    console.log('Current window location:', window.location.href);
    console.log('React Router version:', require('react-router-dom/package.json').version);
  };

  const handleLogout = () => {
    logout();
  };

  // Add debugging for component mount
  console.log('App component rendered');
  console.log('React version:', require('react/package.json').version);

  return (
    <div className="app-container">
      <div className="logo-container">
        <img src="/Eco.png" alt="EcoGrid Logo" className="logo" />
      </div>
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/" onClick={() => handleNavClick('/')}>Log Waste</Link></li>
          <li><Link to="/existing-logs" onClick={() => handleNavClick('/existing-logs')}>View Existing Logs</Link></li>
          <li><Link to="/reports" onClick={() => handleNavClick('/reports')}>Reports</Link></li>
        </ul>
        <div className="user-info">
          <span className="user-role">Welcome, {user?.role || 'Operator'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <LogWaste />
          </ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute>
            <LogWaste />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/existing-logs" element={
          <ProtectedRoute>
            <ExistingLogs />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;