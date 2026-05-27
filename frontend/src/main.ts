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

Promise.all([loadRemoteTranslations('fr'), loadRemoteTranslations('en')]).finally(() => app.mount('#app'));
