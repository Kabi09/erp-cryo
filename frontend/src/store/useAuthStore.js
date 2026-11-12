import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => {
  // Read initial cached state
  const cachedToken = localStorage.getItem('cryo_sales_token');
  const cachedUser = localStorage.getItem('cryo_sales_user')
    ? JSON.parse(localStorage.getItem('cryo_sales_user'))
    : null;

  return {
    user: cachedUser,
    token: cachedToken,
    isAuthenticated: !!cachedToken,
    loading: false,
    error: null,

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;

        localStorage.setItem('cryo_sales_token', token);
        localStorage.setItem('cryo_sales_user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        return { success: true };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Login failed. Please verify credentials.';
        set({ error: errorMsg, loading: false });
        return { success: false, error: errorMsg };
      }
    },

    checkAuth: async () => {
      const token = localStorage.getItem('cryo_sales_token');
      if (!token) {
        set({ user: null, token: null, isAuthenticated: false });
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const user = response.data.user;
        localStorage.setItem('cryo_sales_user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      } catch (err) {
        localStorage.removeItem('cryo_sales_token');
        localStorage.removeItem('cryo_sales_user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    },

    logout: async () => {
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // ignore error during logout
      } finally {
        localStorage.removeItem('cryo_sales_token');
        localStorage.removeItem('cryo_sales_user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    },
  };
});

