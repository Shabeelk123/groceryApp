import axios from 'axios';
import { store } from '../store';
import { setUser } from '../redux/userSlice';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookie-based auth
  timeout: 10000,
});

// Request interceptor — no-op (auth is via httpOnly cookie, not Bearer header)
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor — global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Session expired — clear user from Redux
          store.dispatch(setUser(null));
          break;
        case 403:
          console.error('Forbidden: You do not have permission.');
          break;
        case 500:
          console.error('Server error. Please try again later.');
          break;
      }
    } else if (error.request) {
      console.error('No response from server. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
