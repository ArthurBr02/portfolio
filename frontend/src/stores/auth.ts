import { defineStore } from 'pinia';
import { api } from '../lib/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(username: string, password: string) {
      const data = await api.post<{ token: string }>('/auth/login', { username, password });
      this.token = data.token;
      localStorage.setItem('token', data.token);
    },

    logout() {
      this.token = null;
      localStorage.removeItem('token');
    },
  },
});
