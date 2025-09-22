import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import StaffList from './components/StaffList';
import StaffManagement from './components/StaffManagement';
import LeaveRequestList from './components/LeaveRequestList';
import AddLeaveRequest from './components/AddLeaveRequest';
import EditLeaveRequest from './components/EditLeaveRequest';
import LeaveRequestDetails from './components/LeaveRequestDetails';
import PaymentList from './components/PaymentList';
import AddPayment from './components/AddPayment';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import AddStaff from './components/AddStaff';
import EditStaff from './components/EditStaff';
import StaffDetails from './components/StaffDetails';
import AdminProfile from './components/AdminProfile';
import './App.css';

function RequireItpAuth({ children }) {
  const token = localStorage.getItem('itp_token');
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireItpAuth><Dashboard /></RequireItpAuth>} />
          <Route path="/staff" element={<RequireItpAuth><StaffList /></RequireItpAuth>} />
          <Route path="/management" element={<RequireItpAuth><StaffManagement /></RequireItpAuth>} />
          <Route path="/leave-requests" element={<RequireItpAuth><LeaveRequestList /></RequireItpAuth>} />
          <Route path="/add-leave-request" element={<RequireItpAuth><AddLeaveRequest /></RequireItpAuth>} />
          <Route path="/edit-leave-request/:id" element={<RequireItpAuth><EditLeaveRequest /></RequireItpAuth>} />
          <Route path="/leave-request/:id" element={<RequireItpAuth><LeaveRequestDetails /></RequireItpAuth>} />
          <Route path="/payments" element={<RequireItpAuth><PaymentList /></RequireItpAuth>} />
          <Route path="/payments/add" element={<RequireItpAuth><AddPayment /></RequireItpAuth>} />
          <Route path="/tasks" element={<RequireItpAuth><TaskList /></RequireItpAuth>} />
          <Route path="/tasks/add" element={<RequireItpAuth><AddTask /></RequireItpAuth>} />
          <Route path="/add" element={<RequireItpAuth><AddStaff /></RequireItpAuth>} />
          <Route path="/edit/:id" element={<RequireItpAuth><EditStaff /></RequireItpAuth>} />
          <Route path="/staff/:id" element={<RequireItpAuth><StaffDetails /></RequireItpAuth>} />
          <Route path="/admin-profile" element={<RequireItpAuth><AdminProfile /></RequireItpAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
