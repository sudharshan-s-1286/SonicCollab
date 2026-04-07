import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // important for cookies
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.post('/auth/refresh');
        if (res.data.success) {
          // If refresh is successful, simply return the retry of original request
          // (Wait, since we use cookies for refresh, and HTTPOnly for auth, we might not even need an interceptor for the token if it's all in cookies?
          // BUT the prompt says "JWT (access token) + refresh token in httpOnly cookie". 
          // Assuming access token is returned in JSON and kept in memory.)
          const newAccessToken = res.data.data.token;
          
          // You might need to update the axios default headers or let the store handle it.
          // In this implementation, we will append it as Bearer if we are using headers, or rely on it.
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Let the app know about the new token (via an event or pub/sub if needed).
          // For simplicity here we just retry.
          return api(originalRequest);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Refresh failed, user needs to login again
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
