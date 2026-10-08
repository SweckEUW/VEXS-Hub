import axios from 'axios';

// Setup base client
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptors if needed
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) console.warn('Unauthorized');
    return Promise.reject(error);
  }
);