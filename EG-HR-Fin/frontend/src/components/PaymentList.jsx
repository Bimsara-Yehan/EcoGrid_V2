import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaTruck, FaUsers, FaSearch, FaTimes, FaEye, FaCheck, FaTimesCircle, FaTrash, FaFilter, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaRoute, FaDollarSign, FaHourglassHalf, FaCalendarDay, FaHome, FaUserTie, FaFileAlt, FaPlus } from 'react-icons/fa';
import './PaymentList.css';

const PaymentList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('drivers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [driverPayments, setDriverPayments] = useState([]);
  const [staffPayments, setStaffPayments] = useState([]);

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Fetch payments from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/payments');
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || 'Failed to load payments');
        }
        const records = Array.isArray(json.data) ? json.data : [];
        const drivers = [];
        const staff = [];
        records.forEach((p) => {
          const normalizedStatus = (() => {
            if (typeof p.status === 'string') {
              const s = p.status.toLowerCase();
              if (s === 'approved' || s === 'paid') return 'Paid';
              if (s === 'pending') return 'Pending';
              if (s === 'overdue') return 'Overdue';
              return p.status.charAt(0).toUpperCase() + p.status.slice(1);
            }
            return 'Pending';
          })();
          
          const common = {
            id: p._id || p.id,
            totalAmount: p.totalAmount ?? p.calc?.computedGross ?? p.calc?.total ?? 0,
            date: p.date ? new Date(p.date).toISOString().slice(0, 10) : (p.periodStart ? new Date(p.periodStart).toISOString().slice(0,10) : ''),
            status: normalizedStatus,
            paymentMethod: p.paymentMethod || '-'
          };
          
          // Check if this is a driver payment based on available data
          const hasDriverData = p.calc?.kmDriven || p.calc?.perKmRate || p.distance || p.rate;
          const hasStaffData = p.calc?.daysWorked || p.calc?.hourlyRate || p.hours || p.days || p.ratePerHour || p.ratePerDay;
          
          if (hasDriverData && !hasStaffData) {
            // Driver payment
            drivers.push({
              ...common,
              driverName: p.driverName || 'Driver',
              route: p.route || '-',
              distance: p.distance || p.calc?.kmDriven || 0,
              rate: p.rate || p.calc?.perKmRate || 0
            });
          } else if (hasStaffData || p.category === 'Staff') {
            // Staff payment
            staff.push({
              ...common,
              staffName: p.staffName || 'Staff',
              role: p.role || '-',
              paymentType: p.paymentType || (p.calc?.hourlyRate ? 'Hourly' : 'Daily'),
              hours: p.hours || 0,
              days: p.days || p.calc?.daysWorked || 0,
              rate: p.ratePerHour || p.ratePerDay || p.calc?.hourlyRate || 0
            });
          } else {
            // Default to staff if unclear
            staff.push({
              ...common,
              staffName: p.staffName || 'Staff',
              role: p.role || '-',
              paymentType: 'Daily',
              hours: 0,
              days: p.calc?.daysWorked || 0,
              rate: p.calc?.hourlyRate || 0
            });
          }
        });
        setDriverPayments(drivers);
        setStaffPayments(staff);
      } catch (e) {
        setError(e.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Delete failed');
      setDriverPayments(prev => prev.filter(p => p.id !== id));
      setStaffPayments(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert(e.message || 'Failed to delete payment');
    }
  };

  const handleApprove = async (id) => {
    const notes = window.prompt('Enter approval notes (optional):');
    if (notes === null) return; // User cancelled
    
    try {
      const res = await fetch(`/api/payments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved', approvalNotes: notes || '' })
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to approve payment');
      
      // Update local state
      setDriverPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
      setStaffPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
      alert('Payment approved successfully!');
    } catch (e) {
      alert(e.message || 'Failed to approve payment');
    }
  };

  const handleReject = async (id) => {
    const notes = window.prompt('Enter rejection reason (required):');
    if (!notes || notes.trim() === '') {
      alert('Rejection reason is required');
      return;
    }
    
    try {
      const res = await fetch(`/api/payments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', approvalNotes: notes.trim() })
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to reject payment');
      
      // Update local state
      setDriverPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
      setStaffPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
      alert('Payment rejected successfully!');
    } catch (e) {
      alert(e.message || 'Failed to reject payment');
    }
  };
  const filteredDriverPayments = driverPayments.filter((payment) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      payment.driverName.toLowerCase().includes(term) ||
      payment.route.toLowerCase().includes(term) ||
      String(payment.id).toLowerCase().includes(term);
    const matchesStatus =
      filterStatus === 'all' || (payment.status || '').toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredStaffPayments = staffPayments.filter((payment) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      payment.staffName.toLowerCase().includes(term) ||
      payment.role.toLowerCase().includes(term) ||
      String(payment.id).toLowerCase().includes(term);
    const matchesStatus =
      filterStatus === 'all' || (payment.status || '').toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Paid': return 'status-paid';
      case 'Pending': return 'status-pending';
      case 'Overdue': return 'status-overdue';
      default: return 'status-pending';
    }
  };

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'Hourly': return <FaClock />;
      case 'Daily': return <FaCalendarDay />;
      case 'Per KM': return <FaRoute />;
      default: return <FaDollarSign />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar open">
        <div className="sidebar-header">
          <div className="logo">
            <FaMoneyBillWave className="logo-icon" />
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
            <button className="nav-item active">
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
            <h1 className="page-title">Payment Management</h1>
            <p className="page-subtitle">Manage staff and driver payments</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search payments..."
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
              <button className="add-staff-btn" onClick={() => navigate('/payments/add')}>
                <FaPlus />
                <span>Add Payment</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {loading && <div className="loading">Loading payments...</div>}
          {error && <div className="alert alert-error" style={{marginBottom:'1rem'}}>{error}</div>}

        {/* Tab Navigation */}
        <div className="payment-tabs">
          <button 
            className={`tab-button ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            <FaTruck />
            <span>Driver Payments</span>
            <span className="tab-count">{driverPayments.length}</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <FaUsers />
            <span>Staff Payments</span>
            <span className="tab-count">{staffPayments.length}</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="enhanced-search-section">
          <div className="search-filters-container">
            <div className="search-container">
              <div className="search-icon">
                <FaSearch />
              </div>
              <input
                type="text"
                placeholder="Search by name, route, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="enhanced-search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="filter-container">
              <div className="filter-icon">
                <FaFilter />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="enhanced-filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="search-results-info">
            Showing {activeTab === 'drivers' ? filteredDriverPayments.length : filteredStaffPayments.length} payments
          </div>
        </div>

        {/* Driver Payments Tab */}
        {activeTab === 'drivers' && (
          <div className="payments-grid">
            {filteredDriverPayments.length > 0 ? (
              filteredDriverPayments.map(payment => (
                <div key={payment.id} className="payment-card driver-payment">
                  <div className="payment-header">
                    <div className="payment-id">
                      <FaRoute />
                      <span>{payment.id}</span>
                    </div>
                    <div className={`status-badge ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </div>
                  </div>
                  
                  <div className="driver-info">
                    <div className="driver-avatar">
                      <FaTruck />
                    </div>
                    <div className="driver-details">
                      <h3>{payment.driverName}</h3>
                      <p className="route-info">
                        <FaMapMarkerAlt />
                        <span>{payment.route}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="payment-details">
                    <div className="detail-item">
                      <FaRoute />
                      <span>Distance: {payment.distance} km</span>
                    </div>
                    <div className="detail-item">
                      <FaDollarSign />
                      <span>Rate: Rs. {payment.rate}/km</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>Date: {payment.date}</span>
                    </div>
                    <div className="detail-item">
                      <FaMoneyBillWave />
                      <span>Total: Rs. {payment.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="payment-actions">
                    <button className="action-btn view-btn">
                      <FaEye />
                      <span>View</span>
                    </button>
                    {payment.status === 'Pending' && (
                      <>
                        <button className="action-btn approve-btn" onClick={() => handleApprove(payment.id)}>
                          <FaCheck />
                          <span>Approve</span>
                        </button>
                        <button className="action-btn reject-btn" onClick={() => handleReject(payment.id)}>
                          <FaTimesCircle />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button className="action-btn delete-btn" onClick={() => handleDelete(payment.id)}>
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaTruck />
                </div>
                <h3>No Driver Payments Found</h3>
                <p>No driver payments match your search criteria</p>
                <button 
                  className="enhanced-btn enhanced-btn-primary"
                  onClick={() => navigate('/payments/add')}
                >
                  <FaDollarSign />
                  <span>Add Driver Payment</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Staff Payments Tab */}
        {activeTab === 'staff' && (
          <div className="payments-grid">
            {filteredStaffPayments.length > 0 ? (
              filteredStaffPayments.map(payment => (
                <div key={payment.id} className="payment-card staff-payment">
                  <div className="payment-header">
                    <div className="payment-id">
                      {getPaymentTypeIcon(payment.paymentType)}
                      <span>{payment.id}</span>
                    </div>
                    <div className={`status-badge ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </div>
                  </div>
                  
                  <div className="staff-info">
                    <div className="staff-avatar">
                      <FaUsers />
                    </div>
                    <div className="staff-details">
                      <h3>{payment.staffName}</h3>
                      <p className="role-info">{payment.role}</p>
                    </div>
                  </div>
                  
                  <div className="payment-details">
                    <div className="detail-item">
                      {getPaymentTypeIcon(payment.paymentType)}
                      <span>Type: {payment.paymentType}</span>
                    </div>
                    <div className="detail-item">
                      <FaClock />
                      <span>
                        {payment.paymentType === 'Hourly' 
                          ? `${payment.hours} hours` 
                          : `${payment.days} days`
                        }
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaDollarSign />
                      <span>Rate: Rs. {payment.rate}/{payment.paymentType === 'Hourly' ? 'hr' : 'day'}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>Date: {payment.date}</span>
                    </div>
                    <div className="detail-item">
                      <FaMoneyBillWave />
                      <span>Total: Rs. {payment.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="payment-actions">
                    <button className="action-btn view-btn">
                      <FaEye />
                      <span>View</span>
                    </button>
                    {payment.status === 'Pending' && (
                      <>
                        <button className="action-btn approve-btn" onClick={() => handleApprove(payment.id)}>
                          <FaCheck />
                          <span>Approve</span>
                        </button>
                        <button className="action-btn reject-btn" onClick={() => handleReject(payment.id)}>
                          <FaTimesCircle />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button className="action-btn delete-btn" onClick={() => handleDelete(payment.id)}>
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaUsers />
                </div>
                <h3>No Staff Payments Found</h3>
                <p>No staff payments match your search criteria</p>
                <button 
                  className="enhanced-btn enhanced-btn-primary"
                  onClick={() => navigate('/payments/add')}
                >
                  <FaDollarSign />
                  <span>Add Staff Payment</span>
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PaymentList;
