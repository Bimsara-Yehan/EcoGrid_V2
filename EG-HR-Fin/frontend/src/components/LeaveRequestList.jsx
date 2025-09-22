import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaArrowLeft, FaPlus, FaCalendarAlt, FaUserTie, FaClock, FaCheck, FaTimes as FaX, FaEye, FaTrash, FaFilter, FaCalendarCheck, FaCalendarTimes, FaHome, FaMoneyBillWave, FaFileAlt, FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './LeaveRequestList.css';

const LeaveRequestList = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  // removed page-level download dropdown
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // removed dropdown listeners

  useEffect(() => {
    // Filter leave requests based on search term and status
    let filtered = leaveRequests;
    
    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(request => request.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.staffID?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.staffID?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leaveRequestID?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, leaveRequests]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leaverequests');
      setLeaveRequests(response.data.data);
      setFilteredRequests(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error('Error fetching leave requests:', err);
      setLeaveRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await axios.delete(`/api/leaverequests/${id}`);
        setLeaveRequests(leaveRequests.filter(request => request._id !== id));
        alert('Leave request deleted successfully!');
      } catch (err) {
        alert('Failed to delete leave request');
        console.error('Error deleting leave request:', err);
      }
    }
  };

  const handleApprove = async (id) => {
    const comments = window.prompt('Enter approval comments (optional):');
    if (comments === null) return; // User cancelled
    
    try {
      await axios.patch(`/api/leaverequests/${id}/status`, {
        status: 'approved',
        adminComments: comments || 'Leave request approved'
      });
      
      setLeaveRequests(prev => prev.map(request => 
        request._id === id 
          ? { ...request, status: 'approved', approvedRejectedDate: new Date() }
          : request
      ));
      
      alert('Leave request approved successfully!');
    } catch (err) {
      alert('Failed to approve leave request');
      console.error('Error approving leave request:', err);
    }
  };

  const handleReject = async (id) => {
    const comments = window.prompt('Enter rejection reason (required):');
    if (!comments || comments.trim() === '') {
      alert('Rejection reason is required');
      return;
    }
    
    try {
      await axios.patch(`/api/leaverequests/${id}/status`, {
        status: 'rejected',
        adminComments: comments.trim()
      });
      
      setLeaveRequests(prev => prev.map(request => 
        request._id === id 
          ? { ...request, status: 'rejected', approvedRejectedDate: new Date() }
          : request
      ));
      
      alert('Leave request rejected successfully!');
    } catch (err) {
      alert('Failed to reject leave request');
      console.error('Error rejecting leave request:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Download functions
  const downloadAsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Leave Requests Report', 14, 22);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Prepare table data
      const tableData = filteredRequests.map(request => [
        request.leaveRequestID || 'N/A',
        request.staffID?.name || 'N/A',
        request.leaveType || 'N/A',
        new Date(request.startDate).toLocaleDateString(),
        new Date(request.endDate).toLocaleDateString(),
        request.totalDays || 'N/A',
        request.status || 'N/A',
        new Date(request.requestedDate).toLocaleDateString()
      ]);
      
      // Add table using autoTable
      if (typeof autoTable === 'function') {
        autoTable(doc, {
          head: [['ID', 'Staff Name', 'Leave Type', 'Start Date', 'End Date', 'Total Days', 'Status', 'Requested Date']],
          body: tableData,
          startY: 40,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] }
        });
      } else {
        // Fallback: create a simple table manually
        let yPosition = 50;
        doc.setFontSize(8);
        
        // Headers
        const headers = ['ID', 'Staff Name', 'Leave Type', 'Start Date', 'End Date', 'Total Days', 'Status', 'Requested Date'];
        let xPosition = 14;
        headers.forEach(header => {
          doc.text(header, xPosition, yPosition);
          xPosition += 25;
        });
        
        yPosition += 10;
        
        // Data rows
        tableData.forEach(row => {
          xPosition = 14;
          row.forEach(cell => {
            doc.text(String(cell), xPosition, yPosition);
            xPosition += 25;
          });
          yPosition += 8;
        });
      }
      
      // Save the PDF
      doc.save(`leave-requests-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const downloadAsExcel = () => {
    // Prepare data for Excel
    const excelData = filteredRequests.map(request => ({
      'Leave Request ID': request.leaveRequestID || 'N/A',
      'Staff Name': request.staffID?.name || 'N/A',
      'Staff Role': request.staffID?.role || 'N/A',
      'Leave Type': request.leaveType || 'N/A',
      'Start Date': new Date(request.startDate).toLocaleDateString(),
      'End Date': new Date(request.endDate).toLocaleDateString(),
      'Total Days': request.totalDays || 'N/A',
      'Status': request.status || 'N/A',
      'Reason': request.reason || 'N/A',
      'Requested Date': new Date(request.requestedDate).toLocaleDateString(),
      'Approved/Rejected Date': request.approvedRejectedDate ? new Date(request.approvedRejectedDate).toLocaleDateString() : 'N/A',
      'Admin Comments': request.adminComments || 'N/A'
    }));
    
    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save the file
    saveAs(data, `leave-requests-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Download a single leave request as PDF
  const downloadSingleRequestAsPDF = (request) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('EcoGrid - Leave Request', 14, 18);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);

      doc.setDrawColor(16, 185, 129);
      doc.line(14, 30, 196, 30);

      const lines = [
        [`Request ID`, request.leaveRequestID || 'N/A'],
        [`Staff Name`, request.staffID?.name || 'N/A'],
        [`Role`, request.staffID?.role || 'N/A'],
        [`Leave Type`, request.leaveType || 'N/A'],
        [`Start Date`, new Date(request.startDate).toLocaleDateString()],
        [`End Date`, new Date(request.endDate).toLocaleDateString()],
        [`Total Days`, `${request.totalDays || 'N/A'}`],
        [`Status`, request.status || 'N/A'],
        [`Reason`, request.reason || 'N/A'],
        [`Requested Date`, new Date(request.requestedDate).toLocaleDateString()],
        [`Approved/Rejected Date`, request.approvedRejectedDate ? new Date(request.approvedRejectedDate).toLocaleDateString() : 'N/A'],
        [`Admin Comments`, request.adminComments || 'N/A']
      ];

      let y = 38;
      doc.setFontSize(12);
      lines.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, 14, y);
        doc.setFont(undefined, 'normal');
        doc.text(String(value), 60, y);
        y += 8;
      });

      const filename = `${request.leaveRequestID || 'leave-request'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating single request PDF:', err);
      alert('Error generating PDF. Please try again.');
    }
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
            <h3>Loading Leave Requests</h3>
            <p>Fetching your ECO Grid leave applications...</p>
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
            <FaFileAlt className="logo-icon" />
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
            <button className="nav-item active">
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
            <h1 className="page-title">Leave Requests</h1>
            <p className="page-subtitle">Manage staff leave requests</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search leave requests..."
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
              <button className="back-btn" onClick={() => navigate('/') }>
                <FaArrowLeft />
                <span>Dashboard</span>
              </button>
              <button 
                className="add-request-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Add Request button clicked');
                  navigate('/add-leave-request');
                }}
                type="button"
              >
                <FaPlus />
                <span>Add Request</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">

        {/* Enhanced Search and Filter Section */}
        <div className="enhanced-search-section">
          <div className="search-filters-container">
            <div className="search-container">
              <div className="search-icon">
                <FaSearch />
              </div>
              <input
                type="text"
                placeholder="Search by staff name, role, leave type, or request ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="enhanced-search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="clear-search-btn">
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="filter-container">
              <div className="filter-icon">
                <FaFilter />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="enhanced-filter-select"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          {(searchTerm || statusFilter !== 'All') && (
            <div className="search-results-info">
              <span className="results-count">
                {filteredRequests.length} of {leaveRequests.length} leave requests
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="error-section">
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3>Connection Error</h3>
              <p>{error}</p>
              <button className="enhanced-btn enhanced-btn-primary" onClick={fetchLeaveRequests}>
                <FaSearch />
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            {searchTerm || statusFilter !== 'All' ? (
              <div className="no-results">
                <div className="empty-icon">🔍</div>
                <h3>No matches found</h3>
                <p>No leave requests match your criteria</p>
                <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('All'); }} 
                  className="enhanced-btn enhanced-btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="no-data">
                <div className="empty-icon">📋</div>
                <h3>No Leave Requests</h3>
                <p>Your leave request database is empty</p>
                <Link to="/add-leave-request" className="enhanced-btn enhanced-btn-primary">
                  <FaPlus />
                  Create First Request
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="leave-requests-grid">
            {filteredRequests.map((request) => (
              <div key={request._id} className="leave-request-card">
                <div className="card-background"></div>
                <div className="card-content">
                  <div className="request-header">
                    <div className="request-id">
                      <FaCalendarCheck />
                      <span>{request.leaveRequestID}</span>
                    </div>
                    <div className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </div>
                  </div>
                  
                  <div className="staff-info">
                    <div className="staff-avatar">
                      <FaUserTie />
                    </div>
                    <div className="staff-details">
                      <h3 className="staff-name">{request.staffID?.name || 'N/A'}</h3>
                      <p className="staff-role">{request.staffID?.role || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="leave-details">
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span className="detail-label">Leave Type:</span>
                      <span className="detail-value">{request.leaveType}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarCheck />
                      <span className="detail-label">Start Date:</span>
                      <span className="detail-value">{formatDate(request.startDate)}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarTimes />
                      <span className="detail-label">End Date:</span>
                      <span className="detail-value">{formatDate(request.endDate)}</span>
                    </div>
                    <div className="detail-item">
                      <FaClock />
                      <span className="detail-label">Total Days:</span>
                      <span className="detail-value">{request.totalDays} day(s)</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span className="detail-label">Requested:</span>
                      <span className="detail-value">{formatDate(request.requestedDate)}</span>
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    <Link to={`/leave-request/${request._id}`} className="action-btn view-btn">
                      <FaEye />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => downloadSingleRequestAsPDF(request)}
                      className="action-btn"
                    >
                      <FaDownload />
                      <span>Download</span>
                    </button>
                    {request.status?.toLowerCase() === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="action-btn approve-btn"
                        >
                          <FaCheck />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="action-btn reject-btn"
                        >
                          <FaX />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(request._id)}
                      className="action-btn delete-btn"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
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

export default LeaveRequestList;
