import { create } from 'zustand';
import api from '../services/api';

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
    } catch (error) {
      // console.log("Auth check error, user not logged in");
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
