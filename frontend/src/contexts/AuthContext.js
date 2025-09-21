import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          console.log('User data from /me endpoint:', response.data);
          console.log('Phone from /me:', response.data.phone);
          console.log('Phones array from /me:', response.data.phones);
          setUser(response.data);
          setHasCompletedOnboarding(response.data.hasCompletedOnboarding);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password, role) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password, role });
      const { token: newToken, user: userData } = response.data;
      
      console.log('User data from login:', userData);
      setToken(newToken);
      setUser(userData);
      setHasCompletedOnboarding(userData.hasCompletedOnboarding);
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const adminLogin = async (employeeId, password) => {
    try {
      const response = await axios.post('/api/auth/admin-login', { employeeId, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      setHasCompletedOnboarding(userData.hasCompletedOnboarding);
      
      toast.success('Admin login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Admin login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      let dataToSend = userData;
      let headers = {};
      if (userData instanceof FormData) {
        dataToSend = userData;
        headers['Content-Type'] = 'multipart/form-data';
      }
      const response = await axios.post('/api/auth/register', dataToSend, { headers });
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      setHasCompletedOnboarding(newUser.hasCompletedOnboarding);
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setHasCompletedOnboarding(false);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/user-profile', profileData);
      console.log('Profile update response:', response.data);
      setUser(response.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return false;
    }
  };

  const updateProfileImage = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      const response = await axios.put('/api/user-profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(prev => ({
        ...prev,
        profileImageUrl: response.data.profileImageUrl
      }));
      
      toast.success('Profile image updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile image update failed';
      toast.error(message);
      return false;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/api/user-profile/password', {
        currentPassword,
        newPassword
      });
      
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      toast.error(message);
      return false;
    }
  };

  const toggleTheme = async () => {
    try {
      const response = await axios.put('/api/user-profile/preferences/theme');
      setUser(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          darkModeEnabled: response.data.darkModeEnabled
        }
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Theme update failed';
      toast.error(message);
      return false;
    }
  };

  const updateLanguage = async (language) => {
    try {
      const response = await axios.put('/api/user-profile/preferences/language', { language });
      setUser(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          language: response.data.language
        }
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Language update failed';
      toast.error(message);
      return false;
    }
  };

  const toggleNotifications = async () => {
    try {
      const response = await axios.put('/api/user-profile/preferences/notifications');
      setUser(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notificationsEnabled: response.data.notificationsEnabled
        }
      }));
      toast.success(response.data.message);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Notification preference update failed';
      toast.error(message);
      return false;
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete('/api/user-profile');
      logout();
      toast.success('Account deleted successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Account deletion failed';
      toast.error(message);
      return false;
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await axios.put('/api/user-profile/preferences', { preferences });
      setUser(response.data);
      toast.success('Preferences updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Preferences update failed';
      toast.error(message);
      return false;
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await axios.put('/api/auth/onboarding');
      setUser(response.data);
      setHasCompletedOnboarding(true);
      toast.success('Onboarding completed!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete onboarding';
      toast.error(message);
      return false;
    }
  };

  // Role-based helper functions
  const isAdmin = () => user?.role === 'Admin';
  const isManager = () => user?.role === 'Manager';
  const isTruckDriver = () => user?.role === 'TruckDriver';
  const isIncinerator = () => user?.role === 'Incinerator';
  const isRegularUser = () => user?.role === 'User';
  
  const isAdminRole = () => ['Admin', 'Manager', 'TruckDriver'].includes(user?.role);
  const isUserRole = () => ['User', 'Incinerator'].includes(user?.role);

  const value = {
    user,
    token,
    loading,
    hasCompletedOnboarding,
    isAuthenticated: !!user,
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    updateProfileImage,
    updatePassword,
    updatePreferences,
    toggleTheme,
    updateLanguage,
    toggleNotifications,
    deleteAccount,
    completeOnboarding,
    // Role helpers
    isAdmin,
    isManager,
    isTruckDriver,
    isIncinerator,
    isRegularUser,
    isAdminRole,
    isUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

