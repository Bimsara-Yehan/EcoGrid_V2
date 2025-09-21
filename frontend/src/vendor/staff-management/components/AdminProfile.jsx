import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './AdminProfile.css';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/staff');
      const staffMembers = response.data.data;
      const admin = staffMembers.find(s => s.role?.toLowerCase() === 'admin' || s.role?.toLowerCase() === 'administrator');

      if (admin) {
        setAdminData(admin);
        setEditForm({
          name: admin.name || '',
          email: admin.email || admin.gmail || '',
          phone: admin.phone || '',
          dateOfBirth: admin.dateOfBirth ? new Date(admin.dateOfBirth).toISOString().split('T')[0] : '',
          address: admin.address || '',
          department: admin.department || ''
        });
      } else if (staffMembers.length > 0) {
        // Fallback to first staff member if no explicit admin found
        const firstStaff = staffMembers[0];
        setAdminData(firstStaff);
        setEditForm({
          name: firstStaff.name || '',
          email: firstStaff.email || firstStaff.gmail || '',
          phone: firstStaff.phone || '',
          dateOfBirth: firstStaff.dateOfBirth ? new Date(firstStaff.dateOfBirth).toISOString().split('T')[0] : '',
          address: firstStaff.address || '',
          department: firstStaff.department || ''
        });
        setError('No explicit admin found, showing first staff member as admin profile.');
      } else {
        setError('No staff members found to display as admin profile.');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch admin profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Assuming adminData._id is available for the admin to update
      await axios.put(`/api/staff/${adminData._id}`, editForm);
      alert('Admin profile updated successfully!');
      setIsEditing(false);
      fetchAdminData(); // Re-fetch to update displayed data
    } catch (err) {
      console.error('Error updating admin data:', err);
      setError('Failed to update admin profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original adminData
    setEditForm({
      name: adminData.name || '',
      email: adminData.email || adminData.gmail || '',
      phone: adminData.phone || '',
      dateOfBirth: adminData.dateOfBirth ? new Date(adminData.dateOfBirth).toISOString().split('T')[0] : '',
      address: adminData.address || '',
      department: adminData.department || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="admin-profile-container">
        <div className="loading">Loading admin profile...</div>
      </div>
    );
  }

  if (error && !adminData) { // Only show full error if no adminData could be loaded at all
    return (
      <div className="admin-profile-container">
        <div className="error-section">
          <h2 className="error-title">Error</h2>
          <p className="error-text">{error}</p>
          <button onClick={fetchAdminData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          <div className="header-info">
            <h1 className="page-title">Admin Profile</h1>
            <p className="page-subtitle">Manage your administrator account</p>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <button className="edit-btn" onClick={handleEdit}>
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave}>
                <FaSave />
                <span>Save</span>
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Content */}
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header-section">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2 className="profile-name">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  adminData.name || 'Admin User'
                )}
              </h2>
              <p className="profile-role">
                {isEditing ? (
                  <input
                    type="text"
                    name="role"
                    value={editForm.role}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  adminData.role || 'Administrator'
                )}
              </p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <FaEnvelope className="detail-icon" />
                  <div className="detail-content">
                    <label className="detail-label">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-span">{adminData.email || adminData.gmail || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <FaPhone className="detail-icon" />
                  <div className="detail-content">
                    <label className="detail-label">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-span">{adminData.phone || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <FaIdCard className="detail-icon" />
                  <div className="detail-content">
                    <label className="detail-label">Staff ID</label>
                    <span className="detail-span">{adminData.staffID || 'Not assigned'}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <div className="detail-content">
                    <label className="detail-label">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editForm.dateOfBirth}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-span">{adminData.dateOfBirth ? new Date(adminData.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <FaMapMarkerAlt className="detail-icon" />
                  <div className="detail-content">
                    <label className="detail-label">Address</label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={editForm.address}
                        onChange={handleInputChange}
                        className="edit-textarea"
                        rows="3"
                      />
                    ) : (
                      <span className="detail-span">{adminData.address || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <FaUser className="detail-icon" />
                  <div className="detail-content">
                    <label className="detail-label">Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="department"
                        value={editForm.department}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-span">{adminData.department || 'Administration'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title">Account Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-content">
                    <label className="detail-label">Account Created</label>
                    <span className="detail-span">{adminData.createdAt ? new Date(adminData.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-content">
                    <label className="detail-label">Last Updated</label>
                    <span className="detail-span">{adminData.updatedAt ? new Date(adminData.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;