import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUserTie, FaCalendarAlt, FaCalendarCheck, FaCalendarTimes, FaClock, FaFileAlt, FaSave, FaTimes, FaUsers, FaSync, FaCheckCircle, FaEdit } from 'react-icons/fa';
import './EditLeaveRequest.css';

const EditLeaveRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    staffID: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    totalDays: '',
    reason: '',
    status: 'Pending'
  });
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaffMembers();
    fetchLeaveRequestData();
  }, [id]);

  useEffect(() => {
    // Calculate total days when start and end dates change
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start <= end) {
        const diffTime = Math.abs(end - start);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
        setFormData(prev => ({ ...prev, totalDays: totalDays.toString() }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const fetchStaffMembers = async () => {
    try {
      const response = await axios.get('/api/staff');
      setStaffMembers(response.data.data);
    } catch (err) {
      console.error('Error fetching staff members:', err);
      setError('Failed to load staff members');
    }
  };

  const fetchLeaveRequestData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/leaverequests/${id}`);
      const request = response.data.data;
      
      setFormData({
        staffID: request.staffID._id || request.staffID,
        leaveType: request.leaveType,
        startDate: request.startDate.split('T')[0],
        endDate: request.endDate.split('T')[0],
        totalDays: request.totalDays.toString(),
        reason: request.reason,
        status: request.status
      });
    } catch (err) {
      setError('Failed to fetch leave request data');
      console.error('Error fetching leave request:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.staffID || !formData.leaveType || !formData.startDate || 
        !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await axios.put(`/api/leaverequests/${id}`, {
        staffID: formData.staffID,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: parseInt(formData.totalDays),
        reason: formData.reason,
        status: formData.status
      });

      alert('Leave request updated successfully!');
      navigate('/leave-requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave request');
      console.error('Error updating leave request:', err);
    } finally {
      setSaving(false);
    }
  };

  const leaveTypes = [
    'Annual',
    'Sick',
    'Casual',
    'Maternity',
    'Study',
    'Unpaid',
    'Other'
  ];

  const statusOptions = [
    'Pending',
    'Approved',
    'Rejected',
    'Cancelled'
  ];

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
            <p>Loading leave request data...</p>
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
              <FaEdit />
            </div>
            <div className="header-text">
              <h1>Edit Leave Request</h1>
              <p>Update leave request information</p>
            </div>
          </div>
          <Link to="/leave-requests" className="back-btn">
            <FaArrowLeft />
            <span>Back to Leave Requests</span>
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
          {/* Staff and Leave Type Section */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaUsers />
              </div>
              <h3>Request Details</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="staffID">
                  <FaUserTie />
                  <span>Staff Member *</span>
                </label>
                <select
                  id="staffID"
                  name="staffID"
                  value={formData.staffID}
                  onChange={handleInputChange}
                  className="enhanced-select"
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staffMembers.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} - {staff.role}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="leaveType">
                  <FaFileAlt />
                  <span>Leave Type *</span>
                </label>
                <select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  className="enhanced-select"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Selection Section */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaCalendarAlt />
              </div>
              <h3>Leave Period</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="startDate">
                  <FaCalendarCheck />
                  <span>Start Date *</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">
                  <FaCalendarTimes />
                  <span>End Date *</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration and Status Section */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaClock />
              </div>
              <h3>Duration & Status</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="totalDays">
                  <FaClock />
                  <span>Total Days</span>
                </label>
                <input
                  type="number"
                  id="totalDays"
                  name="totalDays"
                  value={formData.totalDays}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  min="1"
                  readOnly
                />
                <small className="form-text">Automatically calculated from start and end dates</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">
                  <FaCheckCircle />
                  <span>Status</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="enhanced-select"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaFileAlt />
              </div>
              <h3>Reason</h3>
            </div>
            
            <div className="form-group">
              <label htmlFor="reason">
                <FaFileAlt />
                <span>Reason *</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="enhanced-textarea"
                rows="4"
                placeholder="Please provide a detailed reason for the leave request..."
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="enhanced-btn enhanced-btn-secondary"
              onClick={() => navigate('/leave-requests')}
              disabled={saving}
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
                  <span>Update Leave Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveRequest;
