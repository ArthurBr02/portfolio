<template>
  <div class="app-shell">
    <nav class="nav">
      <div class="nav-inner">
        <a href="/" class="nav-brand">
          <span class="nav-brand-mark">A</span>
          <span>{{ settings.settings.site_title || 'Portfolio' }}</span>
        </a>

        <div class="nav-links">
          <a
            v-if="settings.isSectionEnabled('about')"
            href="#about"
            :class="['nav-link', { active: activeSection === 'about' }]"
          >{{ $t('nav.about') }}</a>
          <a
            v-if="settings.isSectionEnabled('skills')"
            href="#skills"
            :class="['nav-link', { active: activeSection === 'skills' }]"
          >{{ $t('nav.skills') }}</a>
          <a
            v-if="settings.isSectionEnabled('projects')"
            href="#projects"
            :class="['nav-link', { active: activeSection === 'projects' }]"
          >{{ $t('nav.projects') }}</a>
          <a
            v-if="settings.isSectionEnabled('experience') || settings.isSectionEnabled('education')"
            href="#experience"
            :class="['nav-link', { active: activeSection === 'experience' }]"
          >{{ $t('nav.experience') }}</a>
          <a
            v-if="settings.isSectionEnabled('contact')"
            href="#contact"
            :class="['nav-link', { active: activeSection === 'contact' }]"
          >{{ $t('nav.contact') }}</a>
        </div>

        <div class="nav-right">
          <span class="nav-available">
            <span class="status-dot" />
            {{ $t('nav.available') }}
          </span>

          <div class="lang-switch">
            <button :class="{ active: locale === 'fr' }" @click="switchLang('fr')">FR</button>
            <button :class="{ active: locale === 'en' }" @click="switchLang('en')">EN</button>
          </div>

          <RouterLink to="/login" class="btn-icon" aria-label="Admin">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </RouterLink>
        </div>
      </div>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useSettingsStore } from '../stores/settings';
import { useI18n } from 'vue-i18n';
import { loadRemoteTranslations } from '../i18n';

export default defineComponent({
  name: 'PublicLayout',
  components: { RouterLink, RouterView },

  setup() {
    const settings = useSettingsStore();
    const { locale } = useI18n();
    return { settings, locale };
  },

  data() {
    return { activeSection: '', observer: null as IntersectionObserver | null };
  },

  async mounted() {
    await this.settings.fetchSettings();
    this.settings.applyToDOM();

    const { api } = await import('../lib/api');
    const profile = await api.get<{ available_for_work: number }>('/profile').catch(() => null);
    if (profile) this.settings.setAvailable(profile.available_for_work === 1);

    this.setupIntersectionObserver();
  },

  beforeUnmount() {
    this.observer?.disconnect();
  },

  methods: {
    setupIntersectionObserver() {
      const sections = document.querySelectorAll('section[id]');
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) this.activeSection = e.target.id;
          }
        },
        { threshold: 0.3 }
      );
      sections.forEach(s => this.observer!.observe(s));
    },

    async switchLang(lang: string) {
      this.locale = lang;
      localStorage.setItem('locale', lang);
      await loadRemoteTranslations(lang);
    },
  },
});
</script>
