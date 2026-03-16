import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * Higher-Order Component to protect routes based on authentication and roles.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasPermission(allowedRoles)) {
    // Show error toast and redirect to dashboard if role is not allowed
    toast.error('Unauthorized: Admin access required for this module.', {
      id: 'auth-denied',
      style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
