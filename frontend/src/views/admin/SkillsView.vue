<template>
  <div>
    <div class="admin-page-head">
      <div><h1>Compétences</h1><p>{{ filtered.length }} / {{ items.length }} skill{{ items.length !== 1 ? 's' : '' }}</p></div>
      <div style="display:flex;gap:.75rem;align-items:center">
        <input v-model="search" type="search" placeholder="Filtrer…" style="width:200px" />
        <button class="btn btn-primary" @click="openCreate">+ Nouvelle compétence</button>
      </div>
    </div>

    <div class="panel">
      <table class="tbl">
        <thead><tr><th>Nom</th><th>Catégorie</th><th>Niveau</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="item in filtered" :key="item.id">
            <td><strong>{{ item.name }}</strong></td>
            <td><span class="chip chip-neutral">{{ item.category_fr }}</span></td>
            <td>
              <span class="skill-badge" :data-level="item.level">{{ levelLabel(item.level) }}</span>
            </td>
            <td>
              <div class="tbl-actions">
                <button class="btn-icon" @click="openEdit(item)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 2l2 2-8 8H2v-2L10 2z" stroke="currentColor" stroke-width="1.5"/></svg></button>
                <button class="btn-icon" @click="remove(item.id)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" stroke-width="1.5"/></svg></button>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:2rem">Aucune compétence</td></tr>
        </tbody>
      </table>
    </div>

    <AppModal v-model="showModal" title="Compétence">
      <h3 style="margin-bottom: 1.5rem">{{ editing ? 'Modifier' : 'Nouvelle' }} compétence</h3>
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div><label class="field-label">Nom</label><input v-model="form.name" /></div>
        <div class="form-row">
          <div><label class="field-label">Catégorie (FR)</label><input v-model="form.category_fr" /></div>
          <div><label class="field-label">Catégorie (EN)</label><input v-model="form.category_en" /></div>
        </div>
        <div>
          <label class="field-label">Niveau</label>
          <select v-model.number="form.level" style="margin-top:.5rem">
            <option :value="1">Notions</option>
            <option :value="2">Maîtrise</option>
            <option :value="3">Expert</option>
          </select>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:.75rem;margin-top:.5rem">
          <button class="btn btn-ghost" @click="showModal = false">Annuler</button>
          <button class="btn btn-primary" @click="saveItem" :disabled="saving">{{ saving ? '…' : 'Sauvegarder' }}</button>
        </div>
      </div>
    </AppModal>
    <AppToast :message="toast" @close="toast = ''" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { api } from '../../lib/api';
import type { Skill } from '../../lib/types';
import AppModal from '../../components/ui/AppModal.vue';
import AppToast from '../../components/ui/AppToast.vue';

const LEVEL_LABELS: Record<number, string> = { 1: 'Notions', 2: 'Maîtrise', 3: 'Expert' };
const empty = () => ({ name: '' as string | null, icon: '' as string | null, category_fr: '' as string | null, category_en: '' as string | null, level: 1 as 1 | 2 | 3, sort_order: 0 });

export default defineComponent({
  name: 'SkillsView',
  components: { AppModal, AppToast },
  data() { return { items: [] as Skill[], search: '', showModal: false, editing: null as Skill | null, form: empty(), saving: false, toast: '' }; },
  computed: {
    filtered(): Skill[] {
      const q = this.search.toLowerCase().trim();
      if (!q) return this.items;
      return this.items.filter(i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.category_fr || '').toLowerCase().includes(q) ||
        (i.category_en || '').toLowerCase().includes(q)
      );
    },
  },
  async mounted() { await this.load(); },
  methods: {
    async load() { this.items = await api.get<Skill[]>('/skills'); },
    openCreate() { this.editing = null; this.form = empty(); this.showModal = true; },
    openEdit(item: Skill) { this.editing = item; this.form = { ...empty(), ...item }; this.showModal = true; },
    async saveItem() {
      this.saving = true;
      try {
        if (this.editing) await api.put(`/admin/skills/${this.editing.id}`, this.form);
        else await api.post('/admin/skills', this.form);
        this.showModal = false; await this.load(); this.toast = 'Sauvegardé !';
      } finally { this.saving = false; }
    },
    async remove(id: number) {
      if (!confirm('Supprimer ?')) return;
      await api.delete(`/admin/skills/${id}`); await this.load(); this.toast = 'Supprimé';
    },
    levelLabel(level: number): string {
      return LEVEL_LABELS[level] || '';
    },
  },
});
</script>
