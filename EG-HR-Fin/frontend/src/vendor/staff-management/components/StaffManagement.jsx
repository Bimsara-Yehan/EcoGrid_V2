import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StaffManagement = () => {
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
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // ...existing code...
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this staff member?')) {
    try {
      await axios.delete(`/api/staff/${id}`);
      const updatedStaff = staff.filter(member => member._id !== id);
      setStaff(updatedStaff);
      setFilteredStaff(updatedStaff);
      alert('Staff member deleted successfully!');
    } catch (err) {
      alert('Failed to delete staff member');
      console.error('Error deleting staff:', err);
    }
  }
};
// ...existing code...

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="card">
        <div className="spinner"></div>
        <p className="text-center">Loading staff data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={fetchStaff}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Staff Management System</h2>
          <p className="text-muted">Full CRUD operations for ECO Grid staff members</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
          <Link to="/add" className="btn btn-primary">
            + Add New Staff
          </Link>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section mb-3">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search staff by name, role, or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search-btn">
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="search-results-info">
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
        )}
      </div>

      {filteredStaff.length === 0 ? (
        <div className="text-center">
          {searchTerm ? (
            <div>
              <p>No staff members found matching "{searchTerm}"</p>
              <button onClick={clearSearch} className="btn btn-secondary">
                Clear Search
              </button>
            </div>
          ) : (
            <p>No staff members found.</p>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Gmail</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member._id}>
                  <td>{member._id}</td>
                  <td>
                    <Link 
                      to={`/staff/${member._id}`}
                      style={{ color: '#28a745', textDecoration: 'none', fontWeight: '600' }}
                    >
                      {member.name}
                    </Link>
                  </td>
                  <td>{member.role}</td>
                  <td>{member.gmail}</td>
                  <td>{member.phone}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/edit/${member._id}`} 
                        className="btn btn-warning btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
