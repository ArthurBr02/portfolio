<template>
  <div>
    <div class="admin-page-head">
      <div><h1>Projets</h1><p>{{ projects.length }} projet{{ projects.length !== 1 ? 's' : '' }}</p></div>
      <button class="btn btn-primary" @click="openCreate">+ Nouveau projet</button>
    </div>

    <div class="panel">
      <table class="tbl">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Technologies</th>
            <th style="text-align: right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in projects" :key="p.id">
            <td><strong>{{ p.title_fr }}</strong></td>
            <td><span class="chip chip-neutral">{{ p.category || '—' }}</span></td>
            <td style="font-size: 0.82rem; color: var(--color-text-muted)">{{ techs(p) }}</td>
            <td>
              <div class="tbl-actions">
                <button class="btn-icon" @click="openEdit(p)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 2l2 2-8 8H2v-2L10 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
                </button>
                <button class="btn-icon" @click="remove(p.id)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!projects.length"><td colspan="4" style="text-align: center; color: var(--color-text-muted); padding: 2rem">Aucun projet</td></tr>
        </tbody>
      </table>
    </div>

    <AppModal v-model="showModal" :title="editing ? 'Modifier le projet' : 'Nouveau projet'">
      <h3 style="margin-bottom: 1.5rem">{{ editing ? 'Modifier' : 'Nouveau' }} projet</h3>
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <div class="form-row">
          <div><label class="field-label">Titre (FR)</label><input v-model="form.title_fr" /></div>
          <div><label class="field-label">Titre (EN)</label><input v-model="form.title_en" /></div>
        </div>
        <div class="form-row">
          <div><label class="field-label">Description courte (FR)</label><textarea v-model="form.short_description_fr" rows="2" /></div>
          <div><label class="field-label">Description courte (EN)</label><textarea v-model="form.short_description_en" rows="2" /></div>
        </div>
        <div class="form-row">
          <div><label class="field-label">Description (FR)</label><textarea v-model="form.description_fr" rows="3" /></div>
          <div><label class="field-label">Description (EN)</label><textarea v-model="form.description_en" rows="3" /></div>
        </div>
        <div class="form-row">
          <div>
            <label class="field-label">Catégorie</label>
            <select v-model="form.category">
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="tools">Outils</option>
            </select>
          </div>
          <div><label class="field-label">Technologies (JSON)</label><input v-model="form.technologies" placeholder='["Vue","Node"]' /></div>
        </div>
        <div class="form-row">
          <div><label class="field-label">URL démo</label><input v-model="form.demo_url" /></div>
          <div><label class="field-label">URL repo</label><input v-model="form.repo_url" /></div>
        </div>
        <div>
          <label class="field-label">Image principale</label>
          <div style="display: flex; gap: 0.75rem; align-items: center">
            <input v-model="form.image_url" placeholder="/uploads/..." style="flex: 1" />
            <label class="btn btn-ghost btn-sm" style="cursor: pointer; white-space: nowrap">
              Upload
              <input type="file" accept="image/*" style="display:none" @change="uploadImage" />
            </label>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem">
          <button class="btn btn-ghost" @click="showModal = false">Annuler</button>
          <button class="btn btn-primary" @click="saveProject" :disabled="saving">{{ saving ? '…' : 'Sauvegarder' }}</button>
        </div>
      </div>
    </AppModal>

    <AppToast :message="toast" @close="toast = ''" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { api } from '../../lib/api';
import { parseTechnologies } from '../../lib/utils';
import type { Project } from '../../lib/types';
import AppModal from '../../components/ui/AppModal.vue';
import AppToast from '../../components/ui/AppToast.vue';

const emptyForm = () => ({
  title_fr: '' as string | null, title_en: '' as string | null,
  description_fr: '' as string | null, description_en: '' as string | null,
  short_description_fr: '' as string | null, short_description_en: '' as string | null,
  image_url: '' as string | null, demo_url: '' as string | null, repo_url: '' as string | null,
  technologies: '' as string | null, category: 'web' as string | null,
});

export default defineComponent({
  name: 'ProjectsView',
  components: { AppModal, AppToast },
  data() {
    return {
      projects: [] as Project[],
      showModal: false,
      editing: null as Project | null,
      form: emptyForm(),
      saving: false,
      toast: '',
    };
  },
  async mounted() { await this.load(); },
  methods: {
    async load() { this.projects = await api.get<Project[]>('/projects'); },
    techs(p: Project) { return parseTechnologies(p.technologies).join(', ') || '—'; },
    openCreate() { this.editing = null; this.form = emptyForm(); this.showModal = true; },
    openEdit(p: Project) {
      this.editing = p;
      this.form = { ...emptyForm(), ...p, technologies: p.technologies || '' };
      this.showModal = true;
    },
    async uploadImage(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const res = await api.upload('/admin/upload', file);
      this.form.image_url = res.url;
    },
    async saveProject() {
      this.saving = true;
      try {
        if (this.editing) {
          await api.put(`/admin/projects/${this.editing.id}`, this.form);
        } else {
          await api.post('/admin/projects', this.form);
        }
        this.showModal = false;
        await this.load();
        this.toast = 'Projet sauvegardé !';
      } finally { this.saving = false; }
    },
    async remove(id: number) {
      if (!confirm('Supprimer ce projet ?')) return;
      await api.delete(`/admin/projects/${id}`);
      await this.load();
      this.toast = 'Projet supprimé';
    },
  },
});
</script>
