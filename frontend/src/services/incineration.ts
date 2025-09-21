// Service adapter for incineration subsystem
// Wraps API calls and reads VITE_API_BASE_URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Re-export the existing apiClient from vendor directory
export { default as apiClient } from '../vendor/incineration/apiClient';

// Additional service functions if needed
export const incinerationAPI = {
  baseURL: API_BASE_URL,
  
  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
  
  // Test connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/waste/health`);
      return { success: true, data: await response.json() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

