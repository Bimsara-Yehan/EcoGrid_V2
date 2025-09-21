import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaArrowLeft, FaUsers, FaEye, FaIdCard, FaEnvelope, FaPhone, FaUserTie, FaHome, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import './StaffList.css';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    // Filter staff based on search term
    const filtered = staff.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.role || member.staffType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.gmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [searchTerm, staff]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff');
      setStaff(response.data.data);
      setFilteredStaff(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch staff data');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="enhanced-page-container">
        <div className="page-background">
          <div className="floating-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
          </div>
        </div>
        <div className="enhanced-card">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h3>Loading Staff Directory</h3>
            <p>Fetching your ECO Grid team data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-page-container">
        <div className="page-background">
          <div className="floating-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
          </div>
        </div>
        <div className="enhanced-card">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="enhanced-btn enhanced-btn-primary" onClick={fetchStaff}>
              <FaSearch />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar open">
        <div className="sidebar-header">
          <div className="logo">
            <FaUserTie className="logo-icon" />
            <span className="logo-text">EcoGrid Admin</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">MENU</h3>
            <button className="nav-item" onClick={() => navigate('/')}>
              <FaHome className="nav-icon" />
              <span className="nav-label">Dashboard</span>
            </button>
            <button className="nav-item active">
              <FaUserTie className="nav-icon" />
              <span className="nav-label">Staff Management</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/payments')}>
              <FaMoneyBillWave className="nav-icon" />
              <span className="nav-label">Payment Management</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/leave-requests')}>
              <FaFileAlt className="nav-icon" />
              <span className="nav-label">Leave Requests</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="page-title">Staff Directory</h1>
            <p className="page-subtitle">Your ECO Grid Team Members</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, role, or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="clear-search-btn">
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="header-actions">
              <button className="back-btn" onClick={() => navigate('/')}>
                <FaArrowLeft />
                <span>Dashboard</span>
              </button>
              <button className="add-staff-btn" onClick={() => navigate('/add')}>
                <FaUserTie />
                <span>Add Staff</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Search Results Info */}
          {searchTerm && (
            <div className="search-results-info">
              <span className="results-count">
                {filteredStaff.length} of {staff.length} staff members
              </span>
            </div>
          )}

          {filteredStaff.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <div className="no-results">
                  <div className="empty-icon">🔍</div>
                  <h3>No matches found</h3>
                  <p>No staff members match "{searchTerm}"</p>
                  <button onClick={clearSearch} className="enhanced-btn enhanced-btn-secondary">
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="no-data">
                  <div className="empty-icon">👥</div>
                  <h3>No Staff Members</h3>
                  <p>Your staff directory is empty</p>
                </div>
              )}
            </div>
          ) : (
            <div className="stats-grid">
              {filteredStaff.map((member) => (
                <div key={member._id} className="stat-card">
                  <div className="stat-icon staff">
                    <FaUserTie />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-title">{member.name}</h3>
                    <p className="stat-value">{member.role || member.staffType || 'Staff'}</p>
                    <div className="staff-details">
                      <div className="detail-item">
                        <FaIdCard />
                        <span>ID: {member._id.slice(-8)}</span>
                      </div>
                      <div className="detail-item">
                        <FaEnvelope />
                        <span>{member.gmail}</span>
                      </div>
                      <div className="detail-item">
                        <FaPhone />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    <button 
                      className="view-details-btn"
                      onClick={() => navigate(`/staff/${member._id}`)}
                    >
                      <FaEye />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffList;
