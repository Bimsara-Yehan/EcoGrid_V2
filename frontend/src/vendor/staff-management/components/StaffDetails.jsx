import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaUserTie, 
  FaIdCard, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaVenusMars, 
  FaBriefcase, 
  FaEdit, 
  FaUser, 
  FaClock, 
  FaDatabase,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import './StaffDetails.css';

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/staff/${id}`);
      setStaff(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch staff details');
      console.error('Error fetching staff details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'On Leave':
        return 'status-leave';
      case 'Resigned':
        return 'status-resigned';
      case 'Retired':
        return 'status-retired';
      default:
        return 'status-active';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

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
            <p>Loading staff details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !staff) {
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
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <div className="error-message">{error || 'Staff member not found'}</div>
            <div className="error-actions">
              <button className="enhanced-btn enhanced-btn-primary" onClick={fetchStaffDetails}>
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
              <FaUserTie />
            </div>
            <div className="header-text">
              <h1>Staff Details</h1>
              <p>View detailed staff member information</p>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/management" className="back-btn">
              <FaArrowLeft />
              <span>Back to Management</span>
            </Link>
            <Link to={`/edit/${staff._id}`} className="enhanced-btn enhanced-btn-primary">
              <FaEdit />
              <span>Edit Staff</span>
            </Link>
          </div>
        </div>

        {/* Staff Profile Section */}
        <div className="staff-profile-section">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2 className="staff-name">{staff.name}</h2>
              <p className="staff-role">{staff.role}</p>
              <span className={`status-badge ${getStatusBadgeClass(staff.employmentStatus)}`}>
                {staff.employmentStatus || 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="info-sections">
          {/* Basic Information */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <FaUser />
              </div>
              <h3>Basic Information</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaIdCard />
                  <span>Staff ID</span>
                </div>
                <div className="info-value">{staff._id}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaIdCard />
                  <span>NIC</span>
                </div>
                <div className="info-value">{staff.nic}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaCalendarAlt />
                  <span>Date of Birth</span>
                </div>
                <div className="info-value">
                  {formatDate(staff.dateOfBirth)} (Age: {calculateAge(staff.dateOfBirth)})
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaVenusMars />
                  <span>Gender</span>
                </div>
                <div className="info-value">{staff.gender}</div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <FaEnvelope />
              </div>
              <h3>Contact Information</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaEnvelope />
                  <span>Email</span>
                </div>
                <div className="info-value">{staff.gmail}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaPhone />
                  <span>Phone Number</span>
                </div>
                <div className="info-value">{staff.phone}</div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Address Information</h3>
            </div>
            <div className="info-item">
              <div className="info-label">
                <FaMapMarkerAlt />
                <span>Address</span>
              </div>
              <div className="info-value">{staff.address}</div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <FaBriefcase />
              </div>
              <h3>Employment Details</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaBriefcase />
                  <span>Role</span>
                </div>
                <div className="info-value">{staff.role}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaUserTie />
                  <span>Employment Status</span>
                </div>
                <div className="info-value">
                  <span className={`status-badge ${getStatusBadgeClass(staff.employmentStatus)}`}>
                    {staff.employmentStatus || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <FaDatabase />
              </div>
              <h3>System Information</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaClock />
                  <span>Created</span>
                </div>
                <div className="info-value">{formatDate(staff.createdAt)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaClock />
                  <span>Last Updated</span>
                </div>
                <div className="info-value">{formatDate(staff.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <div className="action-buttons">
            <Link to={`/edit/${staff._id}`} className="enhanced-btn enhanced-btn-primary">
              <FaEdit />
              <span>Edit Staff Member</span>
            </Link>
            <button
              onClick={() => navigate('/')}
              className="enhanced-btn enhanced-btn-secondary"
            >
              <FaArrowLeft />
              <span>Back to Staff List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;
