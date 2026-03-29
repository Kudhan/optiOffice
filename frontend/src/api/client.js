import axios from 'axios';
import toast from 'react-hot-toast';

const DEBUG = process.env.REACT_APP_DEBUG === 'true' || true; // Force true for now per user request or use env

// Create the axios client instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://optiflow.backend.logybyte.in/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (DEBUG) {
      console.dir(error);
    }

    const { response } = error;

    if (response) {
      const status = response.status;
      const message = response.data.message || response.data.detail || 'An unexpected error occurred';

      // Authentication Errors
      if (status === 401) {
        localStorage.removeItem('token');
        const isLoginPage = window.location.pathname === '/login' || window.location.pathname.endsWith('/login');
        toast.error(isLoginPage ? message : 'Session expired. Please login again.');
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 1500);
      }
      // Authorization/Forbidden Errors (Security Warnings)
      // These triggered accidental logouts before; now they selectively warn the user
      else if (status === 403) {
        const securityDetail = response.data?.detail || response.data?.message || 'Access Denied: Security Policy Enforced.';

        // Immediate Session Termination for Blocked Accounts
        if (securityDetail.toLowerCase().includes('disabled')) {
          localStorage.removeItem('token');
          toast.error(securityDetail, {
            id: 'security-lockout',
            duration: 5000,
            style: { background: '#9f1239', color: '#fff' }
          });
          setTimeout(() => { window.location.href = '/login'; }, 2000);
        } else {
          // Warning Toast for Suspended (Read-only) or other 403s
          toast.error(securityDetail, {
            duration: 5000,
            id: 'security-restriction',
            style: {
              borderRadius: '20px',
              background: '#0B1120',
              color: '#fff',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              fontSize: '12px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }
          });
        }
        return Promise.reject(error);
      }
      // Validation or Client Errors
      else if (status === 400 || status === 422) {
        toast.error(message);
      }
      // Payment Required (SaaS specific)
      else if (status === 402) {
        toast.error("Subscription Required or Past Due.");
      }
      // Server Errors
      else {
        toast.error(DEBUG ? `Error ${status}: ${message}` : 'Something went wrong, please try again');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
