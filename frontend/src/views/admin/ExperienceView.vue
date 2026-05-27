<template>
  <div>
    <div class="admin-page-head">
      <div><h1>Expériences</h1><p>{{ filtered.length }} / {{ items.length }} expérience{{ items.length !== 1 ? 's' : '' }}</p></div>
      <div style="display:flex;gap:.75rem;align-items:center">
        <input v-model="search" type="search" placeholder="Filtrer…" style="width:200px" />
        <button class="btn btn-primary" @click="openCreate">+ Nouvelle expérience</button>
      </div>
    </div>

    <div class="panel">
      <table class="tbl">
        <thead><tr>
          <th :class="['sortable', sortKey === 'role_fr' ? 'sort-' + sortDir : '']" @click="setSort('role_fr')">Rôle</th>
          <th :class="['sortable', sortKey === 'company' ? 'sort-' + sortDir : '']" @click="setSort('company')">Entreprise</th>
          <th :class="['sortable', sortKey === 'start_date' ? 'sort-' + sortDir : '']" @click="setSort('start_date')">Période</th>
          <th style="text-align:right">Actions</th>
        </tr></thead>
        <tbody>
          <tr v-for="item in sorted" :key="item.id">
            <td><strong>{{ item.role_fr }}</strong></td>
            <td>{{ item.company }}</td>
            <td style="font-family: ui-monospace, monospace; font-size: 0.82rem">{{ item.start_date }} — {{ item.current ? 'Présent' : item.end_date }}</td>
            <td>
              <div class="tbl-actions">
                <button class="btn-icon" @click="openEdit(item)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 2l2 2-8 8H2v-2L10 2z" stroke="currentColor" stroke-width="1.5"/></svg>
                </button>
                <button class="btn-icon" @click="remove(item.id)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" stroke-width="1.5"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:2rem">Aucune expérience</td></tr>
        </tbody>
      </table>
    </div>

    <AppModal v-model="showModal" title="Expérience">
      <h3 style="margin-bottom: 1.5rem">{{ editing ? 'Modifier' : 'Nouvelle' }} expérience</h3>
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <div class="form-row">
          <div><label class="field-label">Rôle (FR)</label><input v-model="form.role_fr" /></div>
          <div><label class="field-label">Rôle (EN)</label><input v-model="form.role_en" /></div>
        </div>
        <div><label class="field-label">Entreprise</label><input v-model="form.company" /></div>
        <div class="form-row">
          <div><label class="field-label">Début</label><input v-model="form.start_date" placeholder="2023-01" /></div>
          <div><label class="field-label">Fin</label><input v-model="form.end_date" placeholder="2024-06 ou vide" :disabled="!!form.current" /></div>
        </div>
        <div class="toggle-row">
          <div class="toggle-row-info"><div class="toggle-row-label">Poste actuel</div></div>
          <button :class="['toggle', { on: form.current === 1 }]" @click="form.current = form.current === 1 ? 0 : 1" />
        </div>
        <div class="form-row">
          <div><label class="field-label">Description (FR)</label><textarea v-model="form.description_fr" rows="3" /></div>
          <div><label class="field-label">Description (EN)</label><textarea v-model="form.description_en" rows="3" /></div>
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
import type { Experience } from '../../lib/types';
import AppModal from '../../components/ui/AppModal.vue';
import AppToast from '../../components/ui/AppToast.vue';

const empty = () => ({ role_fr: '' as string | null, role_en: '' as string | null, company: '' as string | null, start_date: '' as string | null, end_date: '' as string | null, description_fr: '' as string | null, description_en: '' as string | null, current: 0, sort_order: 0 });

export default defineComponent({
  name: 'ExperienceView',
  components: { AppModal, AppToast },
  data() {
    return { items: [] as Experience[], search: '', sortKey: 'start_date' as string, sortDir: 'desc' as 'asc' | 'desc', showModal: false, editing: null as Experience | null, form: empty(), saving: false, toast: '' };
  },
  computed: {
    filtered(): Experience[] {
      const q = this.search.toLowerCase().trim();
      if (!q) return this.items;
      return this.items.filter(i =>
        (i.role_fr || '').toLowerCase().includes(q) ||
        (i.role_en || '').toLowerCase().includes(q) ||
        (i.company || '').toLowerCase().includes(q)
      );
    },
    sorted(): Experience[] {
      const list = [...this.filtered];
      const k = this.sortKey as keyof Experience;
      return list.sort((a, b) => {
        const av = String(a[k] ?? '');
        const bv = String(b[k] ?? '');
        return this.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    },
  },
  async mounted() { await this.load(); },
  methods: {
    async load() { this.items = await api.get<Experience[]>('/experiences'); },
    setSort(key: string) {
      if (this.sortKey === key) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      else { this.sortKey = key; this.sortDir = 'asc'; }
    },
    openCreate() { this.editing = null; this.form = empty(); this.showModal = true; },
    openEdit(item: Experience) { this.editing = item; this.form = { ...empty(), ...item }; this.showModal = true; },
    async saveItem() {
      this.saving = true;
      try {
        if (this.editing) await api.put(`/admin/experiences/${this.editing.id}`, this.form);
        else await api.post('/admin/experiences', this.form);
        this.showModal = false; await this.load(); this.toast = 'Sauvegardé !';
      } finally { this.saving = false; }
    },
    async remove(id: number) {
      if (!confirm('Supprimer ?')) return;
      await api.delete(`/admin/experiences/${id}`); await this.load(); this.toast = 'Supprimé';
    },
  },
});
</script>
