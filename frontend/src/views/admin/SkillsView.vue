<template>
  <div>
    <div class="admin-page-head">
      <div><h1>Compétences</h1><p>{{ items.length }} skill{{ items.length !== 1 ? 's' : '' }}</p></div>
      <button class="btn btn-primary" @click="openCreate">+ Nouvelle compétence</button>
    </div>

    <div class="panel">
      <table class="tbl">
        <thead><tr><th>Nom</th><th>Catégorie</th><th>Niveau</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><strong>{{ item.name }}</strong></td>
            <td><span class="chip chip-neutral">{{ item.category_fr }}</span></td>
            <td>
              <div style="display:flex;align-items:center;gap:.75rem">
                <div class="skill-bar" style="width:80px"><div class="skill-bar-fill" :style="{width:`${item.level}%`}" /></div>
                <span style="font-size:.82rem;color:var(--color-text-muted)">{{ item.level }}%</span>
              </div>
            </td>
            <td>
              <div class="tbl-actions">
                <button class="btn-icon" @click="openEdit(item)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 2l2 2-8 8H2v-2L10 2z" stroke="currentColor" stroke-width="1.5"/></svg></button>
                <button class="btn-icon" @click="remove(item.id)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" stroke-width="1.5"/></svg></button>
              </div>
            </td>
          </tr>
          <tr v-if="!items.length"><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:2rem">Aucune compétence</td></tr>
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
          <label class="field-label">Niveau : {{ form.level }}%</label>
          <input type="range" v-model.number="form.level" min="0" max="100" style="width:100%;margin-top:.5rem" />
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

const empty = () => ({ name: '' as string | null, icon: '' as string | null, category_fr: '' as string | null, category_en: '' as string | null, level: 50, sort_order: 0 });

export default defineComponent({
  name: 'SkillsView',
  components: { AppModal, AppToast },
  data() { return { items: [] as Skill[], showModal: false, editing: null as Skill | null, form: empty(), saving: false, toast: '' }; },
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
  },
});
</script>
