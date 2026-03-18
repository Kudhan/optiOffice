import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * Higher-Order Component to protect routes based on authentication and roles.
 */
const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Verifying session...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check granular permission first if provided, else fall back to role-based check
  const check = requiredPermission || allowedRoles;
  
  if (check && !hasPermission(check)) {
    // Show error toast and redirect to dashboard if not allowed
    toast.error('Unauthorized Node: Your clearance level is insufficient for this operation.', {
      id: 'auth-denied',
      style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
