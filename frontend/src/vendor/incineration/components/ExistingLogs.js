import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { useNavigate } from 'react-router-dom';
import './ExistingLogs.css';

function ExistingLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const logsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/waste/logs');
      setLogs(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    setLogs([...logs].sort((a, b) => {
      if (field === 'date') return newOrder === 'asc' ? new Date(a[field]) - new Date(b[field]) : new Date(b[field]) - new Date(a[field]);
      return newOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
    }));
  };

  const handleDelete = (logId) => {
    setLogToDelete(logId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/api/waste/logs/${logToDelete}`);
      fetchLogs();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting log');
    } finally {
      setShowModal(false);
      setLogToDelete(null);
      setLoading(false);
    }
  };

  const filteredLogs = filterCategory ? logs.filter(log => log.category === filterCategory) : logs;
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="existing-logs">
      <div className="page-header">
        <h2>Existing Waste Logs</h2>
        <p className="page-description">View and manage all waste processing logs</p>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="alert alert-info">Loading logs...</div>}
      
      <div className="controls-section">
        <div className="filters">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            <option value="perishable">Perishable</option>
            <option value="non-perishable">Non-Perishable</option>
            <option value="hazardous">Hazardous</option>
            <option value="recyclable">Recyclable</option>
          </select>
        </div>
        <div className="stats">
          <span className="log-count">Showing {currentLogs.length} of {filteredLogs.length} logs</span>
        </div>
      </div>

      <div className="table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} className="sortable-header">
                Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('weight')} className="sortable-header">
                Weight (kg) {sortField === 'weight' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Energy (kWh)</th>
              <th>Emissions (kg CO2)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.length > 0 ? (
              currentLogs.map(log => (
                <tr key={log._id} className="log-row">
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td>{log.weight}</td>
                  <td>{log.category}</td>
                  <td>{log.location}</td>
                  <td>
                    <span className={`status-badge status-${log.status}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.energyProduced || 0}</td>
                  <td>{log.emissions || 0}</td>
                  <td className="log-actions">
                    <button 
                      onClick={() => navigate(`/edit/${log._id}`)}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(log._id)}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" className="no-data">No logs available.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="page-info">Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="pagination-btn"
        >
          Next
        </button>
      </div>

      <div className="navigation-actions">
        <button onClick={() => navigate('/')} className="back-button">
          Back to Log Waste
        </button>
        <button onClick={() => navigate('/reports')} className="reports-button">
          View Reports
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this log?</p>
            <div className="modal-actions">
              <button
                onClick={confirmDelete}
                className="confirm-btn"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExistingLogs;