import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004';

const api = axios.create({
  baseURL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        response: { data: { message: 'Request timed out. Please try again.' } },
      });
    }
    return Promise.reject(error);
  }
);

export default api;



