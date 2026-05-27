<template>
  <div>
    <div class="admin-page-head">
      <div>
        <h1>Paramètres</h1>
        <p>Apparence et contenu du portfolio</p>
      </div>
      <button class="btn btn-primary" @click="save" :disabled="saving">
        {{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}
      </button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 2rem">

      <!-- Thème -->
      <div class="panel">
        <div class="panel-head"><h2>Thème</h2></div>
        <div class="panel-body">
          <div class="theme-grid">
            <div
              v-for="theme in themes"
              :key="theme.id"
              :class="['theme-card', { active: form.active_theme === theme.id }]"
              @click="form.active_theme = theme.id; previewTheme(theme.id)"
            >
              <div class="theme-card-check">✓</div>
              <div class="theme-swatch" :style="theme.swatchStyle" />
              <div class="theme-name">{{ theme.name }}</div>
              <div class="theme-desc">{{ theme.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Typographie -->
      <div class="panel">
        <div class="panel-head"><h2>Typographie</h2></div>
        <div class="panel-body" style="display: flex; gap: 1rem; flex-wrap: wrap">
          <label
            v-for="font in fonts"
            :key="font.id"
            :class="['theme-card', { active: form.active_font === font.id }]"
            style="flex: 1; min-width: 140px; cursor: pointer"
          >
            <input type="radio" :value="font.id" v-model="form.active_font" style="display: none" @change="previewFont(font.id)" />
            <div class="theme-name" :style="{ fontFamily: font.preview }">{{ font.name }}</div>
            <div class="theme-desc">{{ font.desc }}</div>
          </label>
        </div>
      </div>

      <!-- Mise en page -->
      <div class="panel">
        <div class="panel-head"><h2>Mise en page</h2></div>
        <div class="panel-body" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem">
          <div>
            <label class="field-label">Densité</label>
            <select v-model="form.density">
              <option value="compact">Compact</option>
              <option value="regular">Regular</option>
              <option value="comfy">Comfy</option>
            </select>
          </div>
          <div>
            <label class="field-label">Style des cartes</label>
            <select v-model="form.card_style">
              <option value="soft">Soft</option>
              <option value="flat">Flat</option>
              <option value="glass">Glass</option>
            </select>
          </div>
          <div>
            <label class="field-label">Style du hero</label>
            <select v-model="form.hero_style">
              <option value="split">Split</option>
              <option value="centered">Centered</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <div>
            <label class="field-label">Intensité accent</label>
            <select v-model="form.accent_intensity">
              <option value="muted">Muted</option>
              <option value="warm">Warm</option>
              <option value="vivid">Vivid</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sections -->
      <div class="panel">
        <div class="panel-head"><h2>Sections visibles</h2></div>
        <div class="panel-body">
          <div
            v-for="section in sections"
            :key="section.key"
            class="toggle-row"
          >
            <div class="toggle-row-info">
              <div class="toggle-row-label">{{ section.label }}</div>
              <div class="toggle-row-desc">{{ section.desc }}</div>
            </div>
            <button
              :class="['toggle', { on: form[section.key] === 'true' }]"
              @click="form[section.key] = form[section.key] === 'true' ? 'false' : 'true'"
            />
          </div>
        </div>
      </div>

      <!-- Général -->
      <div class="panel">
        <div class="panel-head"><h2>Général</h2></div>
        <div class="panel-body">
          <label class="field-label">Titre du site</label>
          <input v-model="form.site_title" type="text" style="max-width: 400px" />
        </div>
      </div>
    </div>

    <AppToast :message="toast" :type="toastType" @close="toast = ''" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useSettingsStore } from '../../stores/settings';
import AppToast from '../../components/ui/AppToast.vue';

const FONT_MAP: Record<string, string> = {
  fraunces: "'Fraunces', serif",
  inter:    "'Inter', sans-serif",
  playfair: "'Playfair Display', serif",
  mono:     "'Space Grotesk', sans-serif",
};

export default defineComponent({
  name: 'SettingsView',
  components: { AppToast },

  setup() {
    const settings = useSettingsStore();
    return { settings };
  },

  data() {
    return {
      form: {} as Record<string, string>,
      saving: false,
      toast: '',
      toastType: 'success',
      themes: [
        { id: 'sable', name: 'Sable', desc: 'Crème & Terracotta', swatchStyle: { background: 'linear-gradient(135deg, oklch(0.88 0.05 35), oklch(0.92 0.04 80))' } },
        { id: 'foret', name: 'Forêt', desc: 'Vert & Menthe', swatchStyle: { background: 'linear-gradient(135deg, oklch(0.85 0.06 150), oklch(0.90 0.04 130))' } },
        { id: 'crepuscule', name: 'Crépuscule', desc: 'Rose & Mauve', swatchStyle: { background: 'linear-gradient(135deg, oklch(0.86 0.06 350), oklch(0.90 0.04 320))' } },
        { id: 'papier', name: 'Papier', desc: 'Blanc & Marine', swatchStyle: { background: 'linear-gradient(135deg, oklch(0.86 0.05 250), oklch(0.92 0.03 220))' } },
      ],
      fonts: [
        { id: 'fraunces', name: 'Fraunces', desc: '+ Inter', preview: "'Fraunces', serif" },
        { id: 'inter',    name: 'Inter',    desc: 'Inter seul', preview: "'Inter', sans-serif" },
        { id: 'playfair', name: 'Playfair', desc: '+ Inter', preview: "'Playfair Display', serif" },
        { id: 'mono',     name: 'Space Grotesk', desc: '+ JetBrains Mono', preview: "'Space Grotesk', sans-serif" },
      ],
      sections: [
        { key: 'section_hero_enabled', label: 'Hero', desc: 'Section d\'accueil avec votre titre' },
        { key: 'section_about_enabled', label: 'À propos', desc: 'Votre portrait et bio' },
        { key: 'section_skills_enabled', label: 'Compétences', desc: 'Vos skills techniques' },
        { key: 'section_projects_enabled', label: 'Projets', desc: 'Vos réalisations' },
        { key: 'section_experience_enabled', label: 'Expériences', desc: 'Votre parcours professionnel' },
        { key: 'section_education_enabled', label: 'Formation', desc: 'Votre parcours académique' },
        { key: 'section_education_ue_enabled', label: 'UE dans Formation', desc: 'Afficher les unités d\'enseignement sous chaque formation' },
        { key: 'section_contact_enabled', label: 'Contact', desc: 'Formulaire de contact' },
      ],
    };
  },

  mounted() {
    this.form = { ...this.settings.settings };
  },

  methods: {
    previewTheme(id: string) {
      document.documentElement.setAttribute('data-theme', id);
    },
    previewFont(id: string) {
      document.documentElement.setAttribute('data-type', id);
      const fontMap: Record<string, string> = FONT_MAP;
      if (fontMap[id]) document.documentElement.style.setProperty('--font-display', fontMap[id]);
    },
    async save() {
      this.saving = true;
      try {
        await this.settings.updateSettings(this.form);
        this.toast = 'Paramètres sauvegardés !';
        this.toastType = 'success';
      } catch {
        this.toast = 'Erreur lors de la sauvegarde';
        this.toastType = 'error';
      } finally {
        this.saving = false;
      }
    },
  },
});
</script>
