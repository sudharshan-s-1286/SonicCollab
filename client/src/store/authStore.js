import { create } from 'zustand';
import api from '../services/api';

const debugLog = (payload) => {
  // #region agent log
  fetch('http://127.0.0.1:7589/ingest/777e9d3e-cab0-4b34-b6ce-3f2388863c0f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0bff56' },
    body: JSON.stringify({
      sessionId: '0bff56',
      runId: payload.runId || 'pre-fix',
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
};

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  setAuthData: (data) => {
    // Optionally configure the api default headers if we manage token in memory
    if (data.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    set({
      user: { _id: data._id, username: data.username, email: data.email },
      isAuthenticated: true,
      token: data.token,
      isLoading: false
    });
  },

  clearAuth: () => {
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, isAuthenticated: false, token: null, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // First try to refresh token via httpOnly cookie
      const refreshRes = await api.post('/auth/refresh');
      if (refreshRes.data.success) {
        const token = refreshRes.data.data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Then get user data
        const getMeRes = await api.get('/auth/me');
        if (getMeRes.data.success) {
          set({
            user: getMeRes.data.data,
            isAuthenticated: true,
            token,
            isLoading: false
          });
          return;
        }
      }
    } catch {
      debugLog({
        hypothesisId: 'H5',
        location: 'client/src/store/authStore.js:checkAuth',
        message: 'checkAuth failed (likely 401/503)',
        data: {},
      });
      // Not logged in / refresh failed.
    }
    // If anything fails
    set({ user: null, isAuthenticated: false, token: null, isLoading: false });
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data.success) {
        // Will call setAuthData internally
        const data = res.data.data;
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({
          user: { _id: data._id, username: data.username, email: data.email },
          isAuthenticated: true,
          token: data.token,
          isLoading: false
        });
        return { success: true };
      }
    } catch (error) {
      set({ isLoading: false });
      debugLog({
        hypothesisId: 'H5',
        location: 'client/src/store/authStore.js:login',
        message: 'login failed',
        data: { status: error.response?.status, message: String(error.response?.data?.message || '').slice(0, 120) },
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/signup', userData);
      if (res.data.success) {
        const data = res.data.data;
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({
          user: { _id: data._id, username: data.username, email: data.email },
          isAuthenticated: true,
          token: data.token,
          isLoading: false
        });
        return { success: true };
      }
    } catch (error) {
      set({ isLoading: false });
      debugLog({
        hypothesisId: 'H5',
        location: 'client/src/store/authStore.js:signup',
        message: 'signup failed',
        data: { status: error.response?.status, message: String(error.response?.data?.message || '').slice(0, 120) },
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, isAuthenticated: false, token: null, isLoading: false });
    }
  }
}));

export default useAuthStore;
