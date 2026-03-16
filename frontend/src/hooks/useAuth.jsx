import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

/**
 * Custom hook to manage and provide authentication state.
 * Syncs with localStorage and provides role-based helpers.
 */
export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        return jwtDecode(savedToken);
      } catch (err) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error('Invalid token', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Helper booleans for RBAC
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';
  
  // Custom permission check
  const hasPermission = (allowedRoles) => {
    return user && allowedRoles.includes(user.role);
  };

  return {
    token,
    user,
    isAdmin,
    isManager,
    isEmployee,
    hasPermission,
    login,
    logout,
    isAuthenticated: !!token && !!user
  };
};

export default useAuth;
