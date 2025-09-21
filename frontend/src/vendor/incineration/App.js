import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LogWaste from './components/LogWaste';
import Reports from './components/Reports';
import ExistingLogs from './components/ExistingLogs';
import './App.css';

function App() {
  const handleNavClick = (path) => {
    console.log('Navigation clicked:', path);
    console.log('Current window location:', window.location.href);
    console.log('React Router version:', require('react-router-dom/package.json').version);
  };

  // Add debugging for component mount
  console.log('App component rendered');
  console.log('React version:', require('react/package.json').version);

  return (
    <Router>
      <div className="app-container">
        <div className="logo-container">
          <img src="/Eco.png" alt="EcoGrid Logo" className="logo" />
        </div>
        <nav className="navbar">
          <ul className="nav-links">
            <li><Link to="/" onClick={() => handleNavClick('/')}>Log Waste</Link></li>
            <li><Link to="/existing-logs" onClick={() => handleNavClick('/existing-logs')}>View Existing Logs</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<LogWaste />} />
          <Route path="/edit/:id" element={<LogWaste />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/existing-logs" element={<ExistingLogs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;