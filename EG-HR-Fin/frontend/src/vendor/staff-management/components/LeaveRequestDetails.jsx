import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaCalendarCheck, 
  FaCalendarTimes, 
  FaUserTie, 
  FaEnvelope, 
  FaPhone, 
  FaClock, 
  FaDatabase, 
  FaFileAlt, 
  FaCalendarDay, 
  FaCalendarWeek,
  FaUser,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf
} from 'react-icons/fa';
import './LeaveRequestDetails.css';

const LeaveRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveRequestDetails();
  }, [id]);

  const fetchLeaveRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/leaverequests/${id}`);
      setLeaveRequest(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch leave request details');
      console.error('Error fetching leave request details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaHourglassHalf />;
      case 'Approved':
        return <FaCheckCircle />;
      case 'Rejected':
        return <FaTimesCircle />;
      case 'Cancelled':
        return <FaTimesCircle />;
      default:
        return <FaHourglassHalf />;
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <p>Loading leave request details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !leaveRequest) {
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
            <div className="error-message">{error || 'Leave request not found'}</div>
            <div className="error-actions">
              <button className="enhanced-btn enhanced-btn-primary" onClick={fetchLeaveRequestDetails}>
                <FaSync />
                <span>Retry</span>
              </button>
              <button className="enhanced-btn enhanced-btn-secondary" onClick={() => navigate('/leave-requests')}>
                <FaArrowLeft />
                <span>Back to Leave Requests</span>
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
              <FaCalendarAlt />
            </div>
            <div className="header-text">
              <h1>Leave Request Details</h1>
              <p>View detailed leave request information</p>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/leave-requests" className="back-btn">
              <FaArrowLeft />
              <span>Back to Leave Requests</span>
            </Link>
          </div>
        </div>

        {/* Request Profile Section */}
        <div className="request-profile-section">
          <div className="profile-header">
            <div className="profile-avatar">
              {getStatusIcon(leaveRequest.status)}
            </div>
            <div className="profile-info">
              <h2 className="request-id">{leaveRequest.leaveRequestID}</h2>
              <p className="leave-type">{leaveRequest.leaveType}</p>
              <span className={`status-badge ${getStatusBadgeClass(leaveRequest.status)}`}>
                {leaveRequest.status}
              </span>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="info-sections">
          {/* Request Information */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <FaFileAlt />
              </div>
              <h3>Request Information</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaFileAlt />
                  <span>Request ID</span>
                </div>
                <div className="info-value">{leaveRequest.leaveRequestID}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaCalendarAlt />
                  <span>Requested Date</span>
                </div>
                <div className="info-value">{formatDateTime(leaveRequest.requestedDate)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaFileAlt />
                  <span>Leave Type</span>
                </div>
                <div className="info-value">{leaveRequest.leaveType}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaCalendarAlt />
                  <span>Status</span>
                </div>
                <div className="info-value">
                  <span className={`status-badge ${getStatusBadgeClass(leaveRequest.status)}`}>
                    {leaveRequest.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Information */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <FaUserTie />
              </div>
              <h3>Staff Information</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaUser />
                  <span>Staff Name</span>
                </div>
                <div className="info-value">{leaveRequest.staffID?.name || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaUserTie />
                  <span>Role</span>
                </div>
                <div className="info-value">{leaveRequest.staffID?.role || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaEnvelope />
                  <span>Email</span>
                </div>
                <div className="info-value">{leaveRequest.staffID?.gmail || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaPhone />
                  <span>Phone</span>
                </div>
                <div className="info-value">{leaveRequest.staffID?.phone || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <FaCalendarDay />
              </div>
              <h3>Leave Details</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaCalendarCheck />
                  <span>Start Date</span>
                </div>
                <div className="info-value">{formatDate(leaveRequest.startDate)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaCalendarTimes />
                  <span>End Date</span>
                </div>
                <div className="info-value">{formatDate(leaveRequest.endDate)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaCalendarWeek />
                  <span>Total Days</span>
                </div>
                <div className="info-value">{leaveRequest.totalDays} day(s)</div>
              </div>
              <div className="info-item full-width">
                <div className="info-label">
                  <FaFileAlt />
                  <span>Reason</span>
                </div>
                <div className="info-value">{leaveRequest.reason}</div>
              </div>
            </div>
          </div>

          {/* Approval Information */}
          {(leaveRequest.status === 'Approved' || leaveRequest.status === 'Rejected') && (
            <div className="info-section">
              <div className="section-header">
                <div className="section-icon">
                  <FaCheckCircle />
                </div>
                <h3>Approval Information</h3>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">
                    <FaCheckCircle />
                    <span>Action</span>
                  </div>
                  <div className="info-value">
                    <span className={`status-badge ${getStatusBadgeClass(leaveRequest.status)}`}>
                      {leaveRequest.status}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">
                    <FaClock />
                    <span>Action Date</span>
                  </div>
                  <div className="info-value">{formatDateTime(leaveRequest.approvedRejectedDate)}</div>
                </div>
                {leaveRequest.approvedRejectedBy && (
                  <div className="info-item">
                    <div className="info-label">
                      <FaUser />
                      <span>Action By</span>
                    </div>
                    <div className="info-value">
                      {leaveRequest.approvedRejectedBy?.name || 'N/A'} ({leaveRequest.approvedRejectedBy?.role || 'N/A'})
                    </div>
                  </div>
                )}
                {leaveRequest.adminComments && (
                  <div className="info-item full-width">
                    <div className="info-label">
                      <FaFileAlt />
                      <span>Admin Comments</span>
                    </div>
                    <div className="info-value">{leaveRequest.adminComments}</div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                <div className="info-value">{formatDateTime(leaveRequest.createdAt)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaClock />
                  <span>Last Updated</span>
                </div>
                <div className="info-value">{formatDateTime(leaveRequest.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <div className="action-buttons">
            <button
              onClick={() => navigate('/leave-requests')}
              className="enhanced-btn enhanced-btn-secondary"
            >
              <FaArrowLeft />
              <span>Back to Leave Requests</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestDetails;
