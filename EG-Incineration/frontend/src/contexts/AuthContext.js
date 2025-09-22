import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authStatus = localStorage.getItem('isAuthenticated');
        const userRole = localStorage.getItem('userRole');
        const loginTime = localStorage.getItem('loginTime');

        if (authStatus === 'true' && userRole && loginTime) {
          // Check if session is still valid (24 hours)
          const loginDate = new Date(loginTime);
          const now = new Date();
          const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            setIsAuthenticated(true);
            setUser({
              role: userRole,
              loginTime: loginTime
            });
          } else {
            // Session expired, clear storage
            logout();
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData) => {
    try {
      setIsAuthenticated(true);
      setUser(userData);
      
      // Store in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('loginTime', new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('loginTime');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkAuth = () => {
    const authStatus = localStorage.getItem('isAuthenticated');
    return authStatus === 'true';
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

