import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user roles (new system uses roles array)
      const userRoles = user.roles || [user.role]; // Fallback to old system
      if (userRoles.includes('admin') || userRoles.includes('staff')) {
        navigate('/admin-dashboard');
      } else {
        // Customer and Incinerator go to regular dashboard
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  // Show loading while determining redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return null;
};

export default RoleBasedRedirect;

