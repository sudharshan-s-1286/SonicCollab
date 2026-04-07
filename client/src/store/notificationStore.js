import { create } from 'zustand';
import api from '../services/api';

const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  notifications: [],
  preview: [],
  isLoading: false,
  error: null,

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) {
        set({ unreadCount: res.data.data.count });
      }
    } catch (error) {
      set({ error });
    }
  },

  fetchNotifications: async ({ page = 1, limit = 50 } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/notifications?page=${page}&limit=${limit}`);
      if (res.data.success) {
        set({ notifications: res.data.data.notifications, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ error, isLoading: false });
    }
  },

  fetchPreview: async (limit = 5) => {
    try {
      const res = await api.get(`/notifications?page=1&limit=${limit}`);
      if (res.data.success) {
        set({ preview: res.data.data.notifications });
      }
    } catch (error) {
      set({ error });
    }
  },

  markRead: async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        // Refresh local counters/previews; full page can refresh separately.
        await Promise.all([get().fetchUnreadCount(), get().fetchPreview()]);
      }
    } catch (error) {
      set({ error });
    }
  },

  markAllRead: async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data.success) {
        await Promise.all([get().fetchUnreadCount(), get().fetchPreview()]);
      }
    } catch (error) {
      set({ error });
    }
  },
}));

export default useNotificationStore;

