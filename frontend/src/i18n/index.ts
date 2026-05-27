import { createI18n } from 'vue-i18n';
import fr from './fr.json';
import en from './en.json';
import { api } from '../lib/api';

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en },
});

export async function loadRemoteTranslations(lang: string) {
  try {
    const remote = await api.get<Record<string, string>>(`/translations/${lang}`);
    const merged = { ...(lang === 'fr' ? fr : en) };
    for (const [key, value] of Object.entries(remote)) {
      const keys = key.split('.');
      let obj: Record<string, unknown> = merged;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
    }
    i18n.global.setLocaleMessage(lang, merged);
  } catch {
    // fallback to static translations
  }
}
