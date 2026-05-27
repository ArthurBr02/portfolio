<template>
  <div class="login-shell">
    <div class="login-mesh" />
    <div class="login-card scale-in">
      <h1>Administration</h1>
      <p class="lede">Connectez-vous pour accéder au backoffice.</p>

      <form @submit.prevent="submit" style="display: flex; flex-direction: column; gap: 1rem">
        <div>
          <label class="field-label">Identifiant</label>
          <input v-model="form.username" type="text" autocomplete="username" required />
        </div>
        <div>
          <label class="field-label">Mot de passe</label>
          <input v-model="form.password" type="password" autocomplete="current-password" required />
        </div>
        <div v-if="error" style="color: var(--color-error); font-size: 0.9rem">{{ error }}</div>
        <button type="submit" class="btn btn-primary" :disabled="loading" style="margin-top: 0.5rem">
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useSettingsStore } from '../../stores/settings';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const auth = useAuthStore();
    const settings = useSettingsStore();
    return { auth, settings };
  },
  data() {
    return {
      form: { username: '', password: '' },
      loading: false,
      error: '',
    };
  },
  async mounted() {
    await this.settings.fetchSettings();
    this.settings.applyToDOM();
  },
  methods: {
    async submit() {
      this.loading = true;
      this.error = '';
      try {
        await this.auth.login(this.form.username, this.form.password);
        this.$router.push('/admin/dashboard');
      } catch {
        this.error = 'Identifiants incorrects';
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
