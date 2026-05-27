<template>
  <div>
    <div class="admin-page-head">
      <div><h1>Projets</h1><p>{{ filtered.length }} / {{ projects.length }} projet{{ projects.length !== 1 ? 's' : '' }}</p></div>
      <div style="display:flex;gap:.75rem;align-items:center">
        <input v-model="search" type="search" placeholder="Filtrer…" style="width:200px" />
        <button class="btn btn-ghost" @click="showGithubImport = !showGithubImport">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right:4px"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          Importer GitHub
        </button>
        <button class="btn btn-primary" @click="openCreate">+ Nouveau projet</button>
      </div>
    </div>

    <div v-if="showGithubImport" class="panel" style="margin-bottom:1.5rem">
      <div class="panel-body" style="display:flex;gap:.75rem;align-items:flex-end">
        <div style="flex:1">
          <label class="field-label">URL du repo GitHub</label>
          <input v-model="githubUrl" type="url" placeholder="https://github.com/owner/repo" @keyup.enter="runImport" />
        </div>
        <button class="btn btn-primary" @click="runImport" :disabled="importing || !githubUrl">
          {{ importing ? 'Analyse en cours…' : 'Analyser' }}
        </button>
        <button class="btn btn-ghost" @click="showGithubImport = false">Annuler</button>
      </div>
      <div v-if="importError" style="padding:.75rem 1.5rem;color:var(--color-error);font-size:.88rem">{{ importError }}</div>
    </div>

    <div class="panel">
      <table class="tbl">
        <thead>
          <tr>
            <th :class="['sortable', sortKey === 'title_fr' ? 'sort-' + sortDir : '']" @click="setSort('title_fr')">Titre</th>
            <th :class="['sortable', sortKey === 'category' ? 'sort-' + sortDir : '']" @click="setSort('category')">Catégorie</th>
            <th>Technologies</th>
            <th style="text-align: right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in sorted" :key="p.id">
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
          <tr v-if="!filtered.length"><td colspan="4" style="text-align: center; color: var(--color-text-muted); padding: 2rem">Aucun projet</td></tr>
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
      search: '',
      sortKey: 'title_fr' as string,
      sortDir: 'asc' as 'asc' | 'desc',
      showModal: false,
      editing: null as Project | null,
      form: emptyForm(),
      saving: false,
      toast: '',
      showGithubImport: false,
      githubUrl: '',
      importing: false,
      importError: '',
    };
  },
  computed: {
    filtered(): Project[] {
      const q = this.search.toLowerCase().trim();
      if (!q) return this.projects;
      return this.projects.filter(p =>
        (p.title_fr || '').toLowerCase().includes(q) ||
        (p.title_en || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.technologies || '').toLowerCase().includes(q)
      );
    },
    sorted(): Project[] {
      const list = [...this.filtered];
      const k = this.sortKey as keyof Project;
      return list.sort((a, b) => {
        const av = String(a[k] ?? '');
        const bv = String(b[k] ?? '');
        return this.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    },
  },
  async mounted() { await this.load(); },
  methods: {
    async load() { this.projects = await api.get<Project[]>('/projects'); },
    setSort(key: string) {
      if (this.sortKey === key) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      else { this.sortKey = key; this.sortDir = 'asc'; }
    },
    techs(p: Project) { return parseTechnologies(p.technologies).join(', ') || '—'; },
    openCreate() { this.editing = null; this.form = emptyForm(); this.showModal = true; },
    async runImport() {
      if (!this.githubUrl || this.importing) return;
      this.importing = true;
      this.importError = '';
      try {
        const data = await api.post<Record<string, string>>('/admin/github/import', { url: this.githubUrl });
        this.form = { ...emptyForm(), ...data };
        this.editing = null;
        this.showGithubImport = false;
        this.githubUrl = '';
        this.showModal = true;
      } catch (e: unknown) {
        this.importError = e instanceof Error ? e.message : 'Erreur lors de l\'import';
      } finally {
        this.importing = false;
      }
    },
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
