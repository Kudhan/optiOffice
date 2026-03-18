import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../api/client';

/**
 * Custom hook to manage and provide authentication state.
 * Syncs with localStorage and provides role-based helpers.
 */
export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    if (!token) {
        setLoading(false);
        return;
    }
    try {
      const response = await apiClient.get('/users/me');
      setUser(response.data);
      setPermissions(response.data.permissions || []);
    } catch (err) {
      console.error('Failed to fetch user profile', err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setUser(null);
      setPermissions([]);
      setLoading(false);
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
    setPermissions([]);
  };

  // Helper booleans for RBAC
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';
  
  // Backward compatible permission/role check
  const hasPermission = (input) => {
    if (isAdmin) return true;
    if (Array.isArray(input)) {
        // Legacy mode: input is array of allowed roles
        return user && input.includes(user.role);
    }
    // New mode: input is a single permission string
    return permissions.includes(input);
  };

  const hasRole = (roleName) => user?.role === roleName;

  return {
    token,
    user,
    permissions,
    isAdmin,
    isManager,
    isEmployee,
    hasPermission,
    hasRole,
    login,
    logout,
    refreshPermissions: fetchUserProfile,
    isAuthenticated: !!token && !!user,
    loading
  };
};

export default useAuth;
