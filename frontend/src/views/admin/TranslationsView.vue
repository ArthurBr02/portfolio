<template>
  <div>
    <div class="admin-page-head">
      <div><h1>Traductions</h1><p>Personnaliser les textes du portfolio</p></div>
      <div style="display:flex;gap:.75rem">
        <div class="lang-switch">
          <button :class="{ active: lang === 'fr' }" @click="switchLang('fr')">FR</button>
          <button :class="{ active: lang === 'en' }" @click="switchLang('en')">EN</button>
        </div>
        <button class="btn btn-primary" @click="save" :disabled="saving">{{ saving ? '…' : 'Sauvegarder' }}</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-body">
        <p style="color:var(--color-text-muted);font-size:.88rem;margin-bottom:1.5rem">
          Ces traductions remplacent les textes par défaut. Laissez vide pour utiliser la valeur par défaut.
        </p>
        <div style="display:flex;flex-direction:column;gap:.75rem">
          <div v-for="(val, key) in entries" :key="key" style="display:grid;grid-template-columns:220px 1fr;gap:1rem;align-items:center">
            <code style="font-size:.82rem;color:var(--color-text-muted);font-family:ui-monospace,monospace">{{ key }}</code>
            <input :value="val" @input="entries[key] = ($event.target as HTMLInputElement).value" />
          </div>
        </div>
      </div>
    </div>

    <AppToast :message="toast" @close="toast = ''" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { api } from '../../lib/api';
import { loadRemoteTranslations } from '../../i18n';
import AppToast from '../../components/ui/AppToast.vue';

export default defineComponent({
  name: 'TranslationsView',
  components: { AppToast },
  data() {
    return { lang: 'fr', entries: {} as Record<string, string>, saving: false, toast: '' };
  },
  async mounted() { await this.load(); },
  methods: {
    async load() { this.entries = await api.get<Record<string, string>>(`/translations/${this.lang}`); },
    async switchLang(l: string) { this.lang = l; await this.load(); },
    async save() {
      this.saving = true;
      try {
        await api.put('/admin/translations', { lang: this.lang, entries: this.entries });
        await loadRemoteTranslations(this.lang);
        this.toast = 'Traductions sauvegardées !';
      } finally { this.saving = false; }
    },
  },
});
</script>
