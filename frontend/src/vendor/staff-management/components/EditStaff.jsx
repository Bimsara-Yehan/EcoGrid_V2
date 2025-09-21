import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUserEdit, FaUser, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaBriefcase, FaSave, FaTimes, FaSync } from 'react-icons/fa';
import './EditStaff.css';

const EditStaff = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    fetchStaffData();
  }, [id]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/staff/${id}`);
      const staffData = response.data.data;
      
      // Format dates for input fields
      const formattedData = {
        ...staffData,
        dateOfBirth: staffData.dateOfBirth ? new Date(staffData.dateOfBirth).toISOString().split('T')[0] : ''
      };
      
      setFormData(formattedData);
      setError('');
    } catch (err) {
      setError('Failed to fetch staff data');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

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
  setSaving(true);
  setError('');

  try {
    // Sanitize and format payload
    const formattedData = {
      ...formData,
      name: formData.name.trim(),
      role: formData.role.trim(),
      gmail: formData.gmail.trim().toLowerCase(),
      nic: formData.nic.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      dateOfBirth: new Date(formData.dateOfBirth).toISOString()
    };

    await axios.put(`/api/staff/${id}`, formattedData);
    alert('Staff member updated successfully!');
    navigate('/management');
  } catch (err) {
    if (err.response?.data?.error) {
      if (Array.isArray(err.response.data.error)) {
        setError(err.response.data.error.join(', '));
      } else {
        setError(err.response.data.error);
      }
    } else {
      setError('Failed to update staff member');
    }
    console.error('Error updating staff:', err);
  } finally {
    setSaving(false);
  }
};
// ...existing code...

  if (loading) {
    return (
      <div className="enhanced-page-container">
        <div className="page-background">
          <div className="floating-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
            <div className="floating-element element-4"></div>
            <div className="floating-element element-5"></div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading staff data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="enhanced-page-container">
        <div className="page-background">
          <div className="floating-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
            <div className="floating-element element-4"></div>
            <div className="floating-element element-5"></div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <div className="error-message">{error}</div>
            <div className="error-actions">
              <button className="enhanced-btn enhanced-btn-primary" onClick={fetchStaffData}>
                <FaSync />
                <span>Retry</span>
              </button>
              <button className="enhanced-btn enhanced-btn-secondary" onClick={() => navigate('/')}>
                <FaArrowLeft />
                <span>Back to Staff List</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-page-container">
      <div className="page-background">
        <div className="floating-elements">
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
          <div className="floating-element element-4"></div>
          <div className="floating-element element-5"></div>
        </div>
      </div>

      <div className="enhanced-card">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <FaUserEdit />
            </div>
            <div className="header-text">
              <h1>Edit Staff Member</h1>
              <p>Update staff member information</p>
            </div>
          </div>
          <Link to="/management" className="back-btn">
            <FaArrowLeft />
            <span>Back to Management</span>
          </Link>
        </div>

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
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaUser />
              </div>
              <h3>Personal Information</h3>
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
              onClick={() => navigate('/')}
            >
              <FaTimes />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="enhanced-btn enhanced-btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Update Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaff;
