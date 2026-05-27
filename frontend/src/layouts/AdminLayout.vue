<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-mark">A</div>
        <div>
          <div class="sidebar-brand-name">Portfolio</div>
          <div class="sidebar-brand-tag">Admin</div>
        </div>
      </div>

      <div class="sidebar-section">Pilotage</div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin/dashboard" :class="['sidebar-item', { active: isActive('dashboard') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Dashboard
        </RouterLink>
        <RouterLink to="/admin/messages" :class="['sidebar-item', { active: isActive('messages') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1 3a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H3l-2 2V3z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Messages
          <span v-if="messages.unreadCount > 0" class="badge">{{ messages.unreadCount }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-section">Contenu</div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin/profile"      :class="['sidebar-item', { active: isActive('profile') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M1 14c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Profil
        </RouterLink>
        <RouterLink to="/admin/projects"     :class="['sidebar-item', { active: isActive('projects') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5 3V2M11 3V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Projets
        </RouterLink>
        <RouterLink to="/admin/experience"   :class="['sidebar-item', { active: isActive('experience') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 4v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Expériences
        </RouterLink>
        <RouterLink to="/admin/education"    :class="['sidebar-item', { active: isActive('education') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l7 4-7 4-7-4 7-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 7v4c0 1.657 2.239 3 5 3s5-1.343 5-3V7" stroke="currentColor" stroke-width="1.5"/></svg>
          Formation
        </RouterLink>
        <RouterLink to="/admin/skills"       :class="['sidebar-item', { active: isActive('skills') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12h3M2 8h7M2 4h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Compétences
        </RouterLink>
        <RouterLink to="/admin/translations" :class="['sidebar-item', { active: isActive('translations') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 2h8M5 2v2M2 6c2 2 5 2 7 0M10 14l3-8 3 8M11.5 11h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Traductions
        </RouterLink>
      </nav>

      <div class="sidebar-section">Configuration</div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin/settings" :class="['sidebar-item', { active: isActive('settings') }]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.54 11.54l1.41 1.41M3.05 12.95l1.42-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Paramètres
        </RouterLink>
      </nav>

      <div class="sidebar-foot">
        <div class="sidebar-foot-avatar">A</div>
        <div class="sidebar-foot-info">
          <div class="sidebar-foot-name">Admin</div>
          <div class="sidebar-foot-role">Administrateur</div>
        </div>
        <button class="btn-icon btn-sm" @click="logout" title="Déconnexion">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 7h8M10 4l3 3-3 3M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <div class="admin-crumbs">
          <RouterLink to="/admin/dashboard" style="color: inherit">Admin</RouterLink>
          <span class="sep">/</span>
          <span class="current">{{ currentPageTitle }}</span>
        </div>

        <div class="admin-search-wrap" ref="searchWrap">
          <div class="admin-search" :class="{ focused: searchOpen }">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              ref="searchInput"
              type="text"
              placeholder="Rechercher…"
              v-model="searchQuery"
              @input="onSearchInput"
              @focus="searchOpen = true"
              @keydown.escape="closeSearch"
            />
            <kbd @click="focusSearch">⌘K</kbd>
          </div>
          <div v-if="searchOpen && hasResults" class="search-dropdown">
            <template v-for="(group, key) in searchResults" :key="key">
              <template v-if="group.length">
                <div class="search-group-label">{{ groupLabel(key) }}</div>
                <button
                  v-for="item in group"
                  :key="item.id"
                  class="search-result-item"
                  @click="goToResult(key, item.id)"
                >
                  <span class="search-result-label">{{ item.label }}</span>
                  <span class="search-result-sub">{{ item.sub }}</span>
                </button>
              </template>
            </template>
            <div v-if="searchLoading" class="search-empty">Recherche…</div>
          </div>
          <div v-else-if="searchOpen && searchQuery.length >= 2 && !searchLoading" class="search-dropdown">
            <div class="search-empty">Aucun résultat</div>
          </div>
        </div>

        <div class="admin-topbar-actions">
          <RouterLink to="/" class="btn-icon" title="Voir le portfolio" target="_blank">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 7L7 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </RouterLink>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useMessagesStore } from '../stores/messages';
import { useSettingsStore } from '../stores/settings';
import { api } from '../lib/api';

type SearchGroup = { id: number; label: string; sub: string }[];
type SearchResults = Record<string, SearchGroup>;

const GROUP_LABELS: Record<string, string> = {
  projects: 'Projets',
  experiences: 'Expériences',
  education: 'Formation',
  skills: 'Compétences',
  messages: 'Messages',
};

const GROUP_ROUTES: Record<string, string> = {
  projects: '/admin/projects',
  experiences: '/admin/experience',
  education: '/admin/education',
  skills: '/admin/skills',
  messages: '/admin/messages',
};

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  profile: 'Profil',
  projects: 'Projets',
  experience: 'Expériences',
  education: 'Formation',
  skills: 'Compétences',
  messages: 'Messages',
  translations: 'Traductions',
  settings: 'Paramètres',
};

export default defineComponent({
  name: 'AdminLayout',
  components: { RouterLink, RouterView },

  setup() {
    const auth = useAuthStore();
    const messages = useMessagesStore();
    const route = useRoute();
    const router = useRouter();
    const settings = useSettingsStore();
    return { auth, messages, route, router, settings };
  },

  data() {
    return {
      searchQuery: '',
      searchOpen: false,
      searchLoading: false,
      searchResults: {} as SearchResults,
      searchTimer: null as ReturnType<typeof setTimeout> | null,
    };
  },

  computed: {
    currentPageTitle(): string {
      const name = String(this.route.name || '');
      return PAGE_TITLES[name] || name;
    },
    hasResults(): boolean {
      return Object.values(this.searchResults).some((g) => g.length > 0);
    },
  },

  async mounted() {
    await this.settings.fetchSettings();
    this.settings.applyToDOM();
    this.messages.fetchMessages();
    document.addEventListener('keydown', this.onGlobalKey);
    document.addEventListener('click', this.onDocClick);
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.onGlobalKey);
    document.removeEventListener('click', this.onDocClick);
  },

  methods: {
    isActive(name: string): boolean {
      return this.route.name === name;
    },
    logout() {
      this.auth.logout();
      this.router.push('/login');
    },
    focusSearch() {
      (this.$refs.searchInput as HTMLInputElement)?.focus();
    },
    closeSearch() {
      this.searchOpen = false;
      (this.$refs.searchInput as HTMLInputElement)?.blur();
    },
    onGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.focusSearch();
        this.searchOpen = true;
      }
    },
    onDocClick(e: MouseEvent) {
      const wrap = this.$refs.searchWrap as HTMLElement;
      if (wrap && !wrap.contains(e.target as Node)) this.searchOpen = false;
    },
    onSearchInput() {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      if (this.searchQuery.length < 2) { this.searchResults = {}; return; }
      this.searchTimer = setTimeout(() => this.runSearch(), 300);
    },
    async runSearch() {
      this.searchLoading = true;
      try {
        this.searchResults = await api.get<SearchResults>(`/admin/search?q=${encodeURIComponent(this.searchQuery)}`);
      } finally {
        this.searchLoading = false;
      }
    },
    groupLabel(key: string): string {
      return GROUP_LABELS[key] || key;
    },
    goToResult(group: string, id: number) {
      const route = GROUP_ROUTES[group];
      if (route) this.router.push(route);
      this.closeSearch();
      this.searchQuery = '';
      this.searchResults = {};
    },
  },
});
</script>
