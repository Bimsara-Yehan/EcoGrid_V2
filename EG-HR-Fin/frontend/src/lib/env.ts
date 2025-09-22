// Environment configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// API endpoints
export const API_ENDPOINTS = {
  STAFF: '/api/staff-management/staff',
  LEAVE_REQUESTS: '/api/staff-management/leaverequests',
  PAYMENTS: '/api/staff-management/payments'
} as const;
