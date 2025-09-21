import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  timeout: 15000, // Increased timeout for mobile networks
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Mobile-optimized configuration
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Default
  }
});

// Enhanced error handling with detailed debugging
api.interceptors.response.use(
  (res) => {
    console.log('✅ API Success:', res.config.url, res.status);
    return res;
  },
  (error) => {
    console.error('❌ API Error Details:');
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', error.response?.data);
    console.error('Full Error:', error);
    
    // Enhanced error handling for mobile networks
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        response: { data: { message: 'Request timed out. Please check your connection and try again.' } },
      });
    }
    
    // Handle network errors common on mobile
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return Promise.reject({
        response: { data: { message: 'Network error. Please check your internet connection and ensure the backend server is running on port 5000.' } },
      });
    }
    
    // Handle mobile-specific HTTP errors
    if (error.response?.status === 0) {
      return Promise.reject({
        response: { data: { message: 'Connection failed. Please try again.' } },
      });
    }
    
    // Handle CORS errors
    if (error.message?.includes('CORS') || error.message?.includes('cors')) {
      return Promise.reject({
        response: { data: { message: 'CORS error. Please check backend CORS configuration.' } },
      });
    }
    
    // Handle specific HTTP status codes
    if (error.response?.status === 404) {
      return Promise.reject({
        response: { data: { message: 'API endpoint not found. Please check if the backend server is running correctly.' } },
      });
    }
    
    if (error.response?.status === 500) {
      return Promise.reject({
        response: { data: { message: 'Server error. Please check backend logs.' } },
      });
    }
    
    return Promise.reject(error);
  }
);

// Connection test function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Test connection on module load
testConnection();

export default api;



