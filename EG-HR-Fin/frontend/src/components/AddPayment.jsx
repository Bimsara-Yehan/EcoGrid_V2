import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaTruck, FaUsers, FaSave, FaTimes, FaUserTie, FaRoute, FaMapMarkerAlt, FaClock, FaCalendarDay, FaDollarSign, FaCalendarAlt, FaFileAlt, FaExclamationTriangle, FaHome } from 'react-icons/fa';
import './AddPayment.css';

const AddPayment = () => {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState('driver');
  const [formData, setFormData] = useState({
    // Driver Payment Fields
    driverName: '',
    route: '',
    distance: '',
    rate: 200,
    
    // Staff Payment Fields
    staffName: '',
    role: '',
    staffPayType: 'Hourly',
    hours: '',
    days: '',
    ratePerHour: '',
    ratePerDay: '',
    
    // Common Fields
    date: '',
    paymentMethod: 'Bank Transfer',
    notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [staffMembers, setStaffMembers] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Derived driver/staff lists from staffs table

  // Derived driver/staff lists from staffs table
  const isDriver = (s) => {
    const type = String(s.staffType || '').toLowerCase();
    const role = String(s.role || '').toLowerCase();
    return type === 'driver' || role.includes('driver');
  };
  const driverMembers = useMemo(() => staffMembers.filter(isDriver), [staffMembers]);
  const nonDriverStaff = useMemo(() => staffMembers.filter(s => !isDriver(s)), [staffMembers]);

  const [routes] = useState([
    'Colombo - Kandy',
    'Colombo - Galle',
    'Colombo - Jaffna',
    'Kandy - Galle',
    'Colombo - Anuradhapura'
  ]);

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);
        const res = await fetch('/api/staff');
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load staff');
        const list = Array.isArray(json.data) ? json.data : [];
        // Normalize to id, name, role
        const normalized = list.map(s => ({
          id: s._id || s.id,
          name: s.name || s.fullName || '-',
          role: s.role || (s.staffType ? String(s.staffType).replace(/_/g,' ') : '-')
        }));
        setStaffMembers(normalized);
      } catch (e) {
        console.error('Failed to fetch staff:', e);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'staffName') {
      // When a staff member is selected, also set role automatically
      const selected = staffMembers.find(s => s.id === value || s.name === value);
      setFormData(prev => ({
        ...prev,
        staffName: selected ? selected.name : value,
        role: selected ? selected.role : prev.role,
        staffId: selected ? selected.id : prev.staffId
      }));
      return;
    }
    if (name === 'driverName') {
      const selected = staffMembers.find(s => s.id === value || s.name === value);
      setFormData(prev => ({
        ...prev,
        driverName: selected ? selected.name : value,
        role: selected ? selected.role : prev.role,
        driverId: selected ? selected.id : prev.driverId
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    if (paymentType === 'driver') {
      const distance = parseFloat(formData.distance) || 0;
      const rate = parseFloat(formData.rate) || 200;
      return distance * rate;
    } else {
      if (formData.staffPayType === 'Hourly') {
        const hours = parseFloat(formData.hours) || 0;
        const ratePerHour = parseFloat(formData.ratePerHour) || 0;
        return hours * ratePerHour;
      } else {
        const days = parseFloat(formData.days) || 0;
        const ratePerDay = parseFloat(formData.ratePerDay) || 0;
        return days * ratePerDay;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (paymentType === 'driver') {
      if (!formData.driverName || !formData.route || !formData.distance) {
        setError('Please fill in all required fields for driver payment');
        return;
      }
    } else {
      if (!formData.staffName || !formData.staffPayType) {
        setError('Please fill in all required fields for staff payment');
        return;
      }
      
      if (formData.staffPayType === 'Hourly' && (!formData.hours || !formData.ratePerHour)) {
        setError('Please fill in hours and rate per hour');
        return;
      }
      
      if (formData.staffPayType === 'Daily' && (!formData.days || !formData.ratePerDay)) {
        setError('Please fill in days and rate per day');
        return;
      }
    }

    try {
      setSaving(true);
      setError('');

      const base = {
        date: new Date(formData.date).toISOString(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes?.trim() || ''
      };

      let payload;
      if (paymentType === 'driver') {
        const distance = parseFloat(formData.distance) || 0;
        const rate = parseFloat(formData.rate) || 0;
        payload = {
          ...base,
          category: 'Driver',
          staffId: formData.driverId || undefined,
          driverName: formData.driverName.trim(),
          route: formData.route.trim(),
          distance,
          rate,
          totalAmount: distance * rate
        };
      } else {
        const hours = parseFloat(formData.hours) || 0;
        const days = parseFloat(formData.days) || 0;
        const ratePerHour = parseFloat(formData.ratePerHour) || 0;
        const ratePerDay = parseFloat(formData.ratePerDay) || 0;
        const totalAmount = formData.staffPayType === 'Hourly' ? (hours * ratePerHour) : (days * ratePerDay);
        payload = {
          ...base,
          category: 'Staff',
          staffId: formData.staffId || undefined,
          staffName: formData.staffName.trim(),
          role: formData.role.trim(),
          paymentType: formData.staffPayType,
          hours,
          days,
          ratePerHour,
          ratePerDay,
          totalAmount
        };
      }

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error((Array.isArray(json?.error) ? json.error.join(', ') : json?.error) || 'Failed to add payment');
      }

      alert('Payment added successfully!');
      navigate('/payments');
    } catch (err) {
      setError(err.message || 'Failed to add payment');
      console.error('Error adding payment:', err);
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
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
            <h1 className="page-title">Add New Payment</h1>
            <p className="page-subtitle">Create payment for staff or driver</p>
          </div>
          <div className="header-actions">
            <button className="back-btn" onClick={() => navigate('/payments')}>
              <FaArrowLeft />
              <span>Back to Payments</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">

        {/* Error Display */}
        {error && (
          <div className="error-section">
            <FaExclamationTriangle className="error-icon" />
            <span className="error-text">{error}</span>
            <button 
              className="cancel-btn"
              onClick={() => setError('')}
            >
              <FaTimes />
              <span>Dismiss</span>
            </button>
          </div>
        )}

        {/* Payment Type Selection */}
        <div className="payment-type-selector">
          <div className="selector-header">
            <h3 className="selector-title">Select Payment Type</h3>
            <p className="selector-subtitle">Choose the type of payment you want to create</p>
          </div>
          <div className="type-options">
            <button
              type="button"
              className={`type-option ${paymentType === 'driver' ? 'active' : ''}`}
              onClick={() => setPaymentType('driver')}
            >
              <FaTruck className="type-option-icon" />
              <div className="option-content">
                <h4 className="option-title">Driver Payment</h4>
                <p className="option-description">Per kilometer payment (Rs. 200/km)</p>
              </div>
            </button>
            <button
              type="button"
              className={`type-option ${paymentType === 'staff' ? 'active' : ''}`}
              onClick={() => setPaymentType('staff')}
            >
              <FaUsers className="type-option-icon" />
              <div className="option-content">
                <h4 className="option-title">Staff Payment</h4>
                <p className="option-description">Hourly or daily payment</p>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="enhanced-form">
          {/* Driver Payment Form */}
          {paymentType === 'driver' && (
            <>
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <FaTruck />
                  </div>
                  <h3 className="section-title">Driver Information</h3>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="driverName">
                      <FaUserTie />
                      <span>Driver Name *</span>
                    </label>
                    <select
                      id="driverName"
                      name="driverName"
                      value={formData.driverId || ''}
                      onChange={(e) => handleInputChange({ target: { name: 'driverName', value: e.target.value } })}
                      className="enhanced-select"
                      required
                      disabled={loadingStaff}
                    >
                      <option value="">{loadingStaff ? 'Loading drivers...' : 'Select Driver'}</option>
                      {driverMembers.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} - {driver.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="route">
                      <FaRoute />
                      <span>Route *</span>
                    </label>
                    <select
                      id="route"
                      name="route"
                      value={formData.route}
                      onChange={handleInputChange}
                      className="enhanced-select"
                      required
                    >
                      <option value="">Select Route</option>
                      {routes.map(route => (
                        <option key={route} value={route}>
                          {route}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <h3>Distance & Rate</h3>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="distance">
                      <FaRoute />
                      <span>Distance (km) *</span>
                    </label>
                    <input
                      type="number"
                      id="distance"
                      name="distance"
                      value={formData.distance}
                      onChange={handleInputChange}
                      className="enhanced-input"
                      min="0"
                      step="0.1"
                      placeholder="Enter distance in kilometers"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="rate">
                      <FaDollarSign />
                      <span>Rate per km</span>
                    </label>
                    <input
                      type="number"
                      id="rate"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      className="enhanced-input"
                      min="0"
                      placeholder="200"
                      readOnly
                    />
                    <small className="form-text">Fixed rate of Rs. 200 per kilometer</small>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Staff Payment Form */}
          {paymentType === 'staff' && (
            <>
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <FaUsers />
                  </div>
                  <h3>Staff Information</h3>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="staffName">
                      <FaUserTie />
                      <span>Staff Member *</span>
                    </label>
                    <select
                      id="staffName"
                      name="staffName"
                      value={formData.staffId || ''}
                      onChange={(e) => handleInputChange({ target: { name: 'staffName', value: e.target.value } })}
                      className="enhanced-select"
                      required
                      disabled={loadingStaff}
                    >
                      <option value="">{loadingStaff ? 'Loading staff...' : 'Select Staff Member'}</option>
                      {nonDriverStaff.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} - {staff.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="staffPayType">
                      <FaClock />
                      <span>Payment Method *</span>
                    </label>
                    <select
                      id="staffPayType"
                      name="staffPayType"
                      value={formData.staffPayType}
                      onChange={handleInputChange}
                      className="enhanced-select"
                      required
                    >
                      <option value="Hourly">Hourly</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <FaDollarSign />
                  </div>
                  <h3>Payment Details</h3>
                </div>
                
                <div className="form-grid">
                  {formData.staffPayType === 'Hourly' ? (
                    <>
                      <div className="form-group">
                        <label htmlFor="hours">
                          <FaClock />
                          <span>Hours Worked *</span>
                        </label>
                        <input
                          type="number"
                          id="hours"
                          name="hours"
                          value={formData.hours}
                          onChange={handleInputChange}
                          className="enhanced-input"
                          min="0"
                          step="0.5"
                          placeholder="Enter hours worked"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="ratePerHour">
                          <FaDollarSign />
                          <span>Rate per Hour *</span>
                        </label>
                        <input
                          type="number"
                          id="ratePerHour"
                          name="ratePerHour"
                          value={formData.ratePerHour}
                          onChange={handleInputChange}
                          className="enhanced-input"
                          min="0"
                          placeholder="Enter rate per hour"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label htmlFor="days">
                          <FaCalendarDay />
                          <span>Days Worked *</span>
                        </label>
                        <input
                          type="number"
                          id="days"
                          name="days"
                          value={formData.days}
                          onChange={handleInputChange}
                          className="enhanced-input"
                          min="0"
                          placeholder="Enter days worked"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="ratePerDay">
                          <FaDollarSign />
                          <span>Rate per Day *</span>
                        </label>
                        <input
                          type="number"
                          id="ratePerDay"
                          name="ratePerDay"
                          value={formData.ratePerDay}
                          onChange={handleInputChange}
                          className="enhanced-input"
                          min="0"
                          placeholder="Enter rate per day"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Common Payment Details */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaCalendarAlt />
              </div>
              <h3>Payment Details</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="date">
                  <FaCalendarAlt />
                  <span>Payment Date *</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">
                  <FaMoneyBillWave />
                  <span>Payment Method</span>
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="enhanced-select"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Mobile Payment">Mobile Payment</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">
                <FaFileAlt />
                <span>Notes</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="enhanced-textarea"
                rows="3"
                placeholder="Additional notes about the payment..."
              />
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="total-amount-section">
            <div className="total-card">
              <div className="total-header">
                <FaDollarSign />
                <h3>Total Amount</h3>
              </div>
              <div className="total-value">
                Rs. {totalAmount.toLocaleString()}
              </div>
              <div className="total-breakdown">
                {paymentType === 'driver' ? (
                  <p>{formData.distance || 0} km × Rs. {formData.rate}/km</p>
                ) : (
                  <p>
                    {formData.staffPayType === 'Hourly' 
                      ? `${formData.hours || 0} hours × Rs. ${formData.ratePerHour || 0}/hour`
                      : `${formData.days || 0} days × Rs. ${formData.ratePerDay || 0}/day`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="enhanced-btn enhanced-btn-secondary"
              onClick={() => navigate('/payments')}
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
                  <span>Adding Payment...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Add Payment</span>
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

export default AddPayment;
