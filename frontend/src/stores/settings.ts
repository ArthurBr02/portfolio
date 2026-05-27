import { defineStore } from 'pinia';
import { api } from '../lib/api';
import type { Settings } from '../lib/types';

const FONT_MAP: Record<string, { display: string; sans: string }> = {
  fraunces: { display: "'Fraunces', serif", sans: "'Inter', system-ui, sans-serif" },
  inter:    { display: "'Inter', system-ui, sans-serif", sans: "'Inter', system-ui, sans-serif" },
  playfair: { display: "'Playfair Display', serif", sans: "'Inter', system-ui, sans-serif" },
  mono:     { display: "'Space Grotesk', sans-serif", sans: "'JetBrains Mono', ui-monospace, monospace" },
};

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {} as Settings,
  }),

  getters: {
    isSectionEnabled: (state) => (section: string) =>
      state.settings[`section_${section}_enabled`] !== 'false',

    currentTheme: (state) => state.settings.active_theme || 'sable',
    currentFont:  (state) => state.settings.active_font  || 'mono',
    density:      (state) => state.settings.density       || 'regular',
    cardStyle:    (state) => state.settings.card_style    || 'soft',
    heroStyle:    (state) => state.settings.hero_style    || 'split',
    accentIntensity: (state) => state.settings.accent_intensity || 'warm',
  },

  actions: {
    async fetchSettings() {
      this.settings = await api.get<Settings>('/settings');
    },

    applyToDOM() {
      const html = document.documentElement;
      html.setAttribute('data-theme', this.settings.active_theme || 'sable');
      html.setAttribute('data-type',    this.settings.active_font  || 'mono');
      html.setAttribute('data-density', this.settings.density      || 'regular');
      html.setAttribute('data-card',    this.settings.card_style   || 'soft');
      html.setAttribute('data-hero',    this.settings.hero_style   || 'split');
      html.setAttribute('data-accent',  this.settings.accent_intensity || 'warm');

      const fonts = FONT_MAP[this.settings.active_font || 'mono'];
      if (fonts) {
        html.style.setProperty('--font-display', fonts.display);
        html.style.setProperty('--font-sans',    fonts.sans);
      }
    },

    setAvailable(available: boolean) {
      document.documentElement.setAttribute('data-available', available ? '1' : '0');
    },

    async updateSettings(patch: Settings) {
      await api.put('/admin/settings', patch);
      Object.assign(this.settings, patch);
      this.applyToDOM();
    },
  },
});
