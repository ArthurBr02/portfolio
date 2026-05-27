<template>
  <div>
    <div class="admin-page-head">
      <div>
        <h1>Profil</h1>
        <p>Vos informations personnelles</p>
      </div>
      <button class="btn btn-primary" @click="save" :disabled="saving">
        {{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}
      </button>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; align-items: start">
      <div class="panel">
        <div class="panel-head"><h2>Avatar</h2></div>
        <div class="panel-body" style="display: flex; flex-direction: column; align-items: center; gap: 1rem">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--mesh-1), var(--mesh-3)); display: grid; place-items: center; font-size: 2rem; font-weight: 600; color: var(--color-text-primary)">
            <img v-if="form.avatar_url" :src="form.avatar_url" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%" />
            <span v-else>{{ initials(form.name ?? null) }}</span>
          </div>
          <label class="btn btn-ghost btn-sm" style="cursor: pointer">
            Changer l'avatar
            <input type="file" accept="image/*" style="display:none" @change="uploadFile($event, 'avatar_url')" />
          </label>
          <label class="btn btn-ghost btn-sm" style="cursor: pointer">
            Mettre à jour le CV
            <input type="file" accept=".pdf" style="display:none" @change="uploadFile($event, 'cv_url')" />
          </label>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Informations</h2></div>
        <div class="panel-body" style="display: flex; flex-direction: column; gap: 1rem">
          <div class="form-row">
            <div>
              <label class="field-label">Nom</label>
              <input v-model="form.name" type="text" />
            </div>
            <div>
              <label class="field-label">Titre</label>
              <input v-model="form.title" type="text" />
            </div>
          </div>
          <div>
            <label class="field-label">Bio</label>
            <textarea v-model="form.bio" rows="4" style="resize: vertical" />
          </div>
          <div class="form-row">
            <div>
              <label class="field-label">Email</label>
              <input v-model="form.email" type="email" />
            </div>
            <div>
              <label class="field-label">Téléphone</label>
              <input v-model="form.phone" type="tel" />
            </div>
          </div>
          <div>
            <label class="field-label">Localisation</label>
            <input v-model="form.location" type="text" />
          </div>
          <div class="toggle-row">
            <div class="toggle-row-info">
              <div class="toggle-row-label">Disponible pour un emploi</div>
              <div class="toggle-row-desc">Affiche le badge "Disponible" sur le portfolio</div>
            </div>
            <button
              :class="['toggle', { on: form.available_for_work === 1 }]"
              @click="form.available_for_work = form.available_for_work === 1 ? 0 : 1"
            />
          </div>
        </div>
      </div>
    </div>

    <AppToast :message="toast" :type="toastType" @close="toast = ''" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { api } from '../../lib/api';
import { initials } from '../../lib/utils';
import type { Profile } from '../../lib/types';
import AppToast from '../../components/ui/AppToast.vue';

export default defineComponent({
  name: 'ProfileView',
  components: { AppToast },
  data() {
    return {
      form: { name: '', title: '', bio: '', email: '', phone: '', location: '', avatar_url: '', cv_url: '', available_for_work: 0 } as Partial<Profile>,
      saving: false,
      toast: '',
      toastType: 'success',
    };
  },
  async mounted() {
    const profile = await api.get<Profile>('/profile').catch(() => null);
    if (profile) this.form = { ...profile };
  },
  methods: {
    initials,
    async uploadFile(e: Event, field: 'avatar_url' | 'cv_url') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const res = await api.upload('/admin/upload', file);
      this.form[field] = res.url;
    },
    async save() {
      this.saving = true;
      try {
        await api.put('/admin/profile', this.form);
        this.toast = 'Profil sauvegardé !';
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
