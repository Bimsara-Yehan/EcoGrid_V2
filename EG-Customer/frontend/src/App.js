import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleBasedRedirect from './components/auth/RoleBasedRedirect';
import OnboardingScreen from './components/screens/OnboardingScreen';
import LoginScreen from './components/screens/LoginScreen';
import AdminLoginScreen from './components/screens/AdminLoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import AdminDashboardScreen from './components/screens/AdminDashboardScreen';
import WasteCollectionScreen from './components/screens/WasteCollectionScreen';
import RecyclingGuideScreen from './components/screens/RecyclingGuideScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import EditProfileScreen from './components/screens/EditProfileScreen';
import ReportScreen from './components/screens/ReportScreen';
import ReportsDashboardScreen from './components/screens/ReportsDashboardScreen';
import ChangePasswordScreen from './components/screens/ChangePasswordScreen';
import AdminUserManagementScreen from './components/screens/AdminUserManagementScreen';
import TasksScreen from './components/screens/TasksScreen';
import AdminTaskManagementScreen from './components/screens/AdminTaskManagementScreen';
import Layout from './components/layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/onboarding" replace />} />
                <Route path="/onboarding" element={<OnboardingScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/admin-login" element={<AdminLoginScreen />} />
                <Route path="/signup" element={<SignupScreen />} />
                
                {/* Role-based redirect route */}
                <Route path="/redirect" element={
                  <PrivateRoute>
                    <RoleBasedRedirect />
                  </PrivateRoute>
                } />
                
                {/* Protected routes - Admin/Manager/Driver */}
                <Route path="/admin-dashboard" element={
                  <PrivateRoute>
                    <AdminDashboardScreen />
                  </PrivateRoute>
                } />
                <Route path="/reports-dashboard" element={
                  <PrivateRoute>
                    <ReportsDashboardScreen />
                  </PrivateRoute>
                } />
                <Route path="/admin-users" element={
                  <PrivateRoute>
                    <AdminUserManagementScreen />
                  </PrivateRoute>
                } />
                <Route path="/tasks" element={
                  <PrivateRoute>
                    <Layout>
                      <TasksScreen />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/admin-tasks" element={
                  <PrivateRoute>
                    <AdminTaskManagementScreen />
                  </PrivateRoute>
                } />
                
                {/* Protected routes - User/Incinerator */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Layout>
                      <DashboardScreen />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/waste-collection" element={
                  <PrivateRoute>
                    <Layout>
                      <WasteCollectionScreen />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/recycling-guide" element={
                  <PrivateRoute>
                    <Layout>
                      <RecyclingGuideScreen />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/report" element={
                  <PrivateRoute>
                    <Layout>
                      <ReportScreen />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Layout>
                      <ProfileScreen />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/edit-profile" element={
                  <PrivateRoute>
                    <Layout>
                      <EditProfileScreen />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/change-password" element={
                  <PrivateRoute>
                    <Layout>
                      <ChangePasswordScreen />
                    </Layout>
                  </PrivateRoute>
                } />
                
                {/* Redirect to role-based redirect for authenticated users */}
                <Route path="*" element={<Navigate to="/redirect" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
