import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
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


function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/staff" element={<StaffList />} />
          <Route path="/management" element={<StaffManagement />} />
          <Route path="/leave-requests" element={<LeaveRequestList />} />
          <Route path="/add-leave-request" element={<AddLeaveRequest />} />
          <Route path="/edit-leave-request/:id" element={<EditLeaveRequest />} />
          <Route path="/leave-request/:id" element={<LeaveRequestDetails />} />
          <Route path="/payments" element={<PaymentList />} />
          <Route path="/payments/add" element={<AddPayment />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/add" element={<AddTask />} />
          <Route path="/add" element={<AddStaff />} />
          <Route path="/edit/:id" element={<EditStaff />} />
          <Route path="/staff/:id" element={<StaffDetails />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
