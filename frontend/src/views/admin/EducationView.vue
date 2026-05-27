<template>
  <div>
    <div class="admin-page-head">
      <div><h1>Formation</h1><p>{{ filtered.length }} / {{ items.length }} entrée{{ items.length !== 1 ? 's' : '' }}</p></div>
      <div style="display:flex;gap:.75rem;align-items:center">
        <input v-model="search" type="search" placeholder="Filtrer…" style="width:200px" />
        <button class="btn btn-primary" @click="openCreate">+ Nouvelle formation</button>
      </div>
    </div>

    <div class="panel">
      <table class="tbl">
        <thead><tr><th>Diplôme</th><th>École</th><th>Période</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="item in filtered" :key="item.id">
            <td><strong>{{ item.degree_fr }}</strong></td>
            <td>{{ item.school }}</td>
            <td style="font-family:ui-monospace,monospace;font-size:0.82rem">{{ item.start_date }} — {{ item.end_date }}</td>
            <td>
              <div class="tbl-actions">
                <button class="btn-icon" @click="openEdit(item)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 2l2 2-8 8H2v-2L10 2z" stroke="currentColor" stroke-width="1.5"/></svg></button>
                <button class="btn-icon" @click="remove(item.id)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" stroke-width="1.5"/></svg></button>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:2rem">Aucune formation</td></tr>
        </tbody>
      </table>
    </div>

    <AppModal v-model="showModal" title="Formation">
      <h3 style="margin-bottom: 1.5rem">{{ editing ? 'Modifier' : 'Nouvelle' }} formation</h3>
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <div class="form-row">
          <div><label class="field-label">Diplôme (FR)</label><input v-model="form.degree_fr" /></div>
          <div><label class="field-label">Diplôme (EN)</label><input v-model="form.degree_en" /></div>
        </div>
        <div><label class="field-label">École</label><input v-model="form.school" /></div>
        <div class="form-row">
          <div><label class="field-label">Début</label><input v-model="form.start_date" placeholder="2020-09" /></div>
          <div><label class="field-label">Fin</label><input v-model="form.end_date" placeholder="2023-06" /></div>
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
import type { Education } from '../../lib/types';
import AppModal from '../../components/ui/AppModal.vue';
import AppToast from '../../components/ui/AppToast.vue';

const empty = () => ({ school: '' as string | null, degree_fr: '' as string | null, degree_en: '' as string | null, start_date: '' as string | null, end_date: '' as string | null, description_fr: '' as string | null, description_en: '' as string | null, sort_order: 0 });

export default defineComponent({
  name: 'EducationView',
  components: { AppModal, AppToast },
  data() { return { items: [] as Education[], search: '', showModal: false, editing: null as Education | null, form: empty(), saving: false, toast: '' }; },
  computed: {
    filtered(): Education[] {
      const q = this.search.toLowerCase().trim();
      if (!q) return this.items;
      return this.items.filter(i =>
        (i.degree_fr || '').toLowerCase().includes(q) ||
        (i.degree_en || '').toLowerCase().includes(q) ||
        (i.school || '').toLowerCase().includes(q)
      );
    },
  },
  async mounted() { await this.load(); },
  methods: {
    async load() { this.items = await api.get<Education[]>('/education'); },
    openCreate() { this.editing = null; this.form = empty(); this.showModal = true; },
    openEdit(item: Education) { this.editing = item; this.form = { ...empty(), ...item }; this.showModal = true; },
    async saveItem() {
      this.saving = true;
      try {
        if (this.editing) await api.put(`/admin/education/${this.editing.id}`, this.form);
        else await api.post('/admin/education', this.form);
        this.showModal = false; await this.load(); this.toast = 'Sauvegardé !';
      } finally { this.saving = false; }
    },
    async remove(id: number) {
      if (!confirm('Supprimer ?')) return;
      await api.delete(`/admin/education/${id}`); await this.load(); this.toast = 'Supprimé';
    },
  },
});
</script>
