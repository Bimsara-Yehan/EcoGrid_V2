import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaTruck,
  FaMoneyBillWave,
  FaClipboardList,
  FaChartLine,
  FaBars,
  FaHome,
  FaUserTie,
  FaFileAlt,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState({
    totalStaff: 0,
    totalDrivers: 0,
    pendingRequests: 0,
    monthlyPayments: 0,
    pendingPayments: 0,
    approvedLeaves: 0,
    leaveList: [],
    paymentList: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch staff data
        const staffRes = await fetch('/api/staff');
        const staffData = await staffRes.json();
        const staffList = staffData.success ? staffData.data : [];

        // Count drivers vs staff
        const drivers = staffList.filter(s =>
          s.staffType === 'driver' ||
          (s.role && s.role.toLowerCase().includes('driver'))
        );
        const nonDrivers = staffList.filter(s =>
          s.staffType !== 'driver' &&
          (!s.role || !s.role.toLowerCase().includes('driver'))
        );

        console.log('Dashboard stats:', {
          total: staffList.length,
          drivers: drivers.length,
          nonDrivers: nonDrivers.length
        });

        // Fetch leave requests
        const leaveRes = await fetch('/api/leaverequests');
        const leaveData = await leaveRes.json();
        console.log('Leave requests API response:', leaveData);
        const leaveList = leaveData.success ? leaveData.data : leaveData;
        console.log('Leave list:', leaveList);
        const pendingLeaves = leaveList.filter(l => l.status === 'Pending').length;
        const approvedLeaves = leaveList.filter(l => l.status === 'Approved').length;
        console.log('Pending leaves:', pendingLeaves, 'Approved leaves:', approvedLeaves);

        // Fetch payments for monthly stats
        const paymentRes = await fetch('/api/payments');
        const paymentData = await paymentRes.json();
        console.log('Payments API response:', paymentData);
        const paymentList = paymentData.success ? paymentData.data : paymentData;
        console.log('Payment list:', paymentList);

        // Calculate monthly payment total
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyPayments = paymentList
          .filter(p => {
            const paymentDate = new Date(p.date || p.periodStart);
            return paymentDate.getMonth() === currentMonth &&
                   paymentDate.getFullYear() === currentYear;
          })
          .reduce((sum, p) => sum + (p.totalAmount || p.calc?.computedGross || 0), 0);

        // Calculate pending payments
        const pendingPayments = paymentList.filter(p => p.status === 'Pending').length;
        console.log('Pending payments:', pendingPayments, 'Monthly payments:', monthlyPayments);

        const finalStats = {
          totalStaff: nonDrivers.length,
          totalDrivers: drivers.length,
          pendingRequests: pendingLeaves,
          monthlyPayments: monthlyPayments,
          pendingPayments: pendingPayments,
          approvedLeaves: approvedLeaves,
          leaveList: leaveList,
          paymentList: paymentList
        };
        console.log('Final stats object:', finalStats);
        setStats(finalStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set fallback data for testing
        setStats({
          totalStaff: 5,
          totalDrivers: 3,
          pendingRequests: 2,
          monthlyPayments: 50000,
          pendingPayments: 1,
          approvedLeaves: 8,
          leaveList: [],
          paymentList: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome, path: '/', active: true },
    { id: 'staff', label: 'Staff Management', icon: FaUserTie, path: '/staff' },
    { id: 'payments', label: 'Payment Management', icon: FaMoneyBillWave, path: '/payments' },
    { id: 'leaves', label: 'Leave Requests', icon: FaFileAlt, path: '/leave-requests' },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  // Calculate monthly payment data from real data
  const calculateMonthlyPayments = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const monthPayments = stats.paymentList.filter(p => {
        const paymentDate = new Date(p.date || p.periodStart);
        return paymentDate.getMonth() === index && paymentDate.getFullYear() === currentYear;
      });

      const totalAmount = monthPayments.reduce((sum, p) => sum + (p.totalAmount || p.calc?.computedGross || 0), 0);

      return {
        month: month,
        amount: totalAmount
      };
    });
  };

  const monthlyPaymentData = calculateMonthlyPayments();

  const pendingRequestsData = [
    { type: 'Leave Requests', count: stats.pendingRequests, color: '#10B981' },
    { type: 'Payment Pending', count: stats.pendingPayments, color: '#F59E0B' },
    { type: 'Approved', count: stats.approvedLeaves, color: '#3B82F6' }
  ];

  console.log('Pending requests data for chart:', pendingRequestsData);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img
              src="/ecogrid-logo.svg"
              alt="EcoGrid Logo"
              className="logo-icon"
            />
            <span className="logo-text">EcoGrid Admin</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">MENU</h3>
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${item.active ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.path)}
              >
                <item.icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="header-right" style={{ display: 'flex', gap: 8 }}>
            <button
              className="user-profile"
              onClick={() => navigate('/admin-profile')}
            >
              <div className="user-avatar">A</div>
              <span className="user-name">Admin</span>
            </button>
            <button
              className="user-profile"
              onClick={() => { localStorage.removeItem('itp_token'); localStorage.removeItem('itp_role'); navigate('/login', { replace: true }); }}
              title="Logout"
            >
              <FaSignOutAlt />
              <span className="user-name" style={{ marginLeft: 6 }}>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className={`stat-icon staff`}>
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Staff</h3>
                <p className="stat-value">{loading ? '...' : stats.totalStaff}</p>
                <span className="stat-change positive">+12% from last month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon drivers`}>
                <FaTruck />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Drivers</h3>
                <p className="stat-value">{loading ? '...' : stats.totalDrivers}</p>
                <span className="stat-change positive">+8% from last month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon requests`}>
                <FaClipboardList />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Pending Requests</h3>
                <p className="stat-value">{loading ? '...' : stats.pendingRequests}</p>
                <span className="stat-change negative">-5% from last week</span>
              </div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon payments`}>
                <FaMoneyBillWave />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Monthly Payments</h3>
                <p className="stat-value">Rs. {loading ? '...' : stats.monthlyPayments.toLocaleString()}</p>
                <span className="stat-change positive">+15% from last month</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Pending Requests Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Pending Requests Overview</h3>
              </div>
              <div className="chart-content">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    Loading chart data...
                  </div>
                ) : (
                  <div className="pie-chart">
                    {pendingRequestsData.map((item, index) => (
                      <div key={index} className="pie-segment">
                        <div
                          className="segment-bar"
                          style={{
                            backgroundColor: item.color,
                            width: `${Math.max((item.count / Math.max(...pendingRequestsData.map(d => d.count), 1)) * 100, item.count > 0 ? 10 : 0)}%`
                          }}
                        ></div>
                        <div className="segment-info">
                          <span className="segment-label">{item.type}</span>
                          <span className="segment-value">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Payment Statistics */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Monthly Payment Statistics</h3>
              </div>
              <div className="chart-content">
                <div className="bar-chart">
                  {monthlyPaymentData.map((item, index) => (
                    <div key={index} className="bar-item">
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${(item.amount / Math.max(...monthlyPaymentData.map(d => d.amount))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="bar-label">{item.month}</span>
                      <span className="bar-value">Rs. {(item.amount / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3 className="section-title">Quick Actions</h3>
            <div className="action-buttons">
              <button
                className="action-btn"
                onClick={() => navigate('/add')}
              >
                <FaUserTie />
                <span>Add Staff Member</span>
              </button>
              <button
                className="action-btn"
                onClick={() => navigate('/payments/add')}
              >
                <FaMoneyBillWave />
                <span>Create Payment</span>
              </button>
              <button
                className="action-btn"
                onClick={() => navigate('/leave-requests')}
              >
                <FaFileAlt />
                <span>Review Leave Requests</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;