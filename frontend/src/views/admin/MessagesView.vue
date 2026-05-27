<template>
  <div>
    <div class="admin-page-head">
      <div>
        <h1>Messages</h1>
        <p>{{ messages.length }} message{{ messages.length !== 1 ? 's' : '' }}, {{ unreadCount }} non lu{{ unreadCount !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <div class="panel">
      <div class="msg-list">
        <template v-for="msg in messages" :key="msg.id">
          <div :class="['msg-item', { unread: msg.is_read === 0 }]" @click="toggle(msg.id)">
            <span :class="['msg-unread-dot', { read: msg.is_read === 1 }]" />
            <div class="msg-avatar">{{ initials(msg.name) }}</div>
            <div class="msg-content">
              <div class="msg-name">
                {{ msg.name }}
                <span class="email">{{ msg.email }}</span>
              </div>
              <div class="msg-subject">{{ msg.subject }}</div>
            </div>
            <div class="msg-time">{{ relTime(msg.created_at) }}</div>
            <div class="msg-actions" @click.stop>
              <button
                v-if="msg.is_read === 0"
                class="btn-icon"
                title="Marquer comme lu"
                @click="markRead(msg.id)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7l4 4 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
              <button class="btn-icon" title="Supprimer" @click="remove(msg.id)">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>
          <div v-if="expandedId === msg.id" style="padding: 1.25rem 1.5rem; background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border)">
            <p style="font-size: 0.92rem; white-space: pre-wrap">{{ msg.message }}</p>
            <a :href="`mailto:${msg.email}?subject=Re: ${msg.subject}`" class="btn btn-ghost btn-sm" style="margin-top: 1rem">
              Répondre par email
            </a>
          </div>
        </template>
        <div v-if="!messages.length" style="padding: 2rem; text-align: center; color: var(--color-text-muted)">
          Aucun message reçu
        </div>
      </div>
    </div>

    <AppToast :message="toast" @close="toast = ''" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { api } from '../../lib/api';
import { initials, relativeTime } from '../../lib/utils';
import { useMessagesStore } from '../../stores/messages';
import type { Message } from '../../lib/types';
import AppToast from '../../components/ui/AppToast.vue';

export default defineComponent({
  name: 'MessagesView',
  components: { AppToast },
  setup() {
    const messagesStore = useMessagesStore();
    return { messagesStore };
  },
  data() {
    return {
      messages: [] as Message[],
      expandedId: null as number | null,
      toast: '',
    };
  },
  computed: {
    unreadCount(): number {
      return this.messages.filter(m => m.is_read === 0).length;
    },
  },
  async mounted() {
    await this.load();
  },
  methods: {
    initials,
    relTime(d: string) { return relativeTime(d); },
    async load() {
      this.messages = await api.get<Message[]>('/admin/messages');
    },
    toggle(id: number) {
      this.expandedId = this.expandedId === id ? null : id;
      const msg = this.messages.find(m => m.id === id);
      if (msg && msg.is_read === 0) this.markRead(id);
    },
    async markRead(id: number) {
      await api.put(`/admin/messages/${id}/read`);
      const msg = this.messages.find(m => m.id === id);
      if (msg) msg.is_read = 1;
      this.messagesStore.fetchMessages();
    },
    async remove(id: number) {
      await api.delete(`/admin/messages/${id}`);
      this.messages = this.messages.filter(m => m.id !== id);
      this.toast = 'Message supprimé';
      this.messagesStore.fetchMessages();
    },
  },
});
</script>
