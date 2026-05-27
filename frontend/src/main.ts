import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { i18n, loadRemoteTranslations } from './i18n';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

const locale = localStorage.getItem('locale') || 'fr';
loadRemoteTranslations(locale).finally(() => app.mount('#app'));
