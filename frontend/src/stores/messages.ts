import { defineStore } from 'pinia';
import { api } from '../lib/api';
import type { Message } from '../lib/types';

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    messages: [] as Message[],
  }),

  getters: {
    unreadCount: (state) => state.messages.filter(m => m.is_read === 0).length,
  },

  actions: {
    async fetchMessages() {
      this.messages = await api.get<Message[]>('/admin/messages');
    },
  },
});
