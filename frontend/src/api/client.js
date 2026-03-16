import axios from 'axios';
import toast from 'react-hot-toast';

const DEBUG = process.env.REACT_APP_DEBUG === 'true' || true; // Force true for now per user request or use env

// Create the axios client instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
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
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
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
