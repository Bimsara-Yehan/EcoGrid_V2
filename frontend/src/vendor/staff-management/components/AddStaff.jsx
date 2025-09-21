import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUserPlus, FaUser, FaUserTie, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaBriefcase, FaSave, FaTimes, FaHome, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa';
import './AddStaff.css';

const AddStaff = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    dateOfBirth: '',
    gender: '',
    nic: '',
    gmail: '',
    phone: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ...existing code...
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Client-side required checks
    const missing = [];
    ['name','role','dateOfBirth','gender','nic','gmail','phone','address'].forEach((k) => {
      const v = formData[k];
      if (v === undefined || v === null || String(v).trim() === '') missing.push(k);
    });
    if (missing.length) {
      setError(`Please fill required field(s): ${missing.join(', ')}`);
      setLoading(false);
      return;
    }

    // Validate gender enum
    const allowedGenders = ['Male','Female','Other'];
    if (!allowedGenders.includes(formData.gender)) {
      setError(`Invalid gender. Allowed values: ${allowedGenders.join(', ')}`);
      setLoading(false);
      return;
    }

    // Validate date format quickly
    const dob = new Date(formData.dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      setError('Invalid date of birth. Use YYYY-MM-DD.');
      setLoading(false);
      return;
    }

    // Sanitize and format payload
    const formattedData = {
      ...formData,
      name: formData.name.trim(),
      role: formData.role.trim(),
      gmail: formData.gmail.trim().toLowerCase(),
      nic: formData.nic.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      dateOfBirth: dob.toISOString()
    };

    const response = await axios.post('/api/staff', formattedData);
    if (response.data.success) {
      alert('Staff member added successfully!');
      navigate('/staff');
    } else {
      throw new Error(response.data.error || 'Failed to add staff member');
    }
  } catch (err) {
    console.error('Error adding staff:', err);
    
    if (err.response?.data?.error) {
      const msg = err.response.data.error;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else if (typeof msg === 'string') {
        // better messages for duplicates
        if (msg.toLowerCase().includes('duplicate gmail')) {
          setError('Email is already in use. Please use a different Gmail.');
        } else if (msg.toLowerCase().includes('duplicate nic')) {
          setError('NIC already exists. Please verify the NIC number.');
        } else if (msg.toLowerCase().includes('validation')) {
          setError(`Validation error: ${msg}`);
        } else {
          setError(msg);
        }
      } else {
        setError('Failed to add staff member');
      }
    } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
      setError('Cannot connect to server. Please check if the backend is running.');
    } else if (err.response?.status === 500) {
      setError('Server error. Please try again later.');
    } else {
      setError(err.message || 'Failed to add staff member');
    }
  } finally {
    setLoading(false);
  }
};
// ...existing code...

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
            <button className="nav-item" onClick={() => navigate('/staff')}>
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
            <h1 className="page-title">Add New Staff Member</h1>
            <p className="page-subtitle">Create a new staff member for ECO Grid</p>
          </div>
          <div className="header-right">
            <button className="back-btn" onClick={() => navigate('/staff')}>
              <FaArrowLeft />
              <span>Back to Staff List</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Error Display */}
          {error && (
            <div className="error-section">
              <div className="error-container">
                <div className="error-icon">⚠️</div>
                <div className="error-message">{error}</div>
                <button 
                  className="enhanced-btn enhanced-btn-secondary"
                  onClick={() => setError('')}
                >
                  <FaTimes />
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Form */}
          <form onSubmit={handleSubmit} className="enhanced-form">
            {/* Personal Information Section */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Personal Information</h3>
              </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  <FaUser />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="enhanced-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">
                  <FaBriefcase />
                  <span>Role *</span>
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  className="enhanced-input"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Enter job role"
                  required
                />
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaCalendarAlt />
              </div>
              <h3>Personal Details</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="dateOfBirth">
                  <FaCalendarAlt />
                  <span>Date of Birth *</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="enhanced-input"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">
                  <FaVenusMars />
                  <span>Gender *</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="enhanced-select"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaEnvelope />
              </div>
              <h3>Contact Information</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nic">
                  <FaIdCard />
                  <span>NIC *</span>
                </label>
                <input
                  type="text"
                  id="nic"
                  name="nic"
                  className="enhanced-input"
                  value={formData.nic}
                  onChange={handleInputChange}
                  placeholder="Enter NIC number"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="gmail">
                  <FaEnvelope />
                  <span>Gmail *</span>
                </label>
                <input
                  type="email"
                  id="gmail"
                  name="gmail"
                  className="enhanced-input"
                  value={formData.gmail}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">
                <FaPhone />
                <span>Phone Number *</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="enhanced-input"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Address Information</h3>
            </div>
            
            <div className="form-group">
              <label htmlFor="address">
                <FaMapMarkerAlt />
                <span>Address *</span>
              </label>
              <textarea
                id="address"
                name="address"
                className="enhanced-textarea"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                rows="4"
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="enhanced-btn enhanced-btn-secondary"
              onClick={() => navigate('/staff')}
            >
              <FaTimes />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="enhanced-btn enhanced-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Add Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;
