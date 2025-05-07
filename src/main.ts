import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import './style.css';
import App from './App.vue';
import { MAIN_THEME } from './theme/main-theme';

const pinia = createPinia();
const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: MAIN_THEME,
    options: {
      darkModeSelector: false
  }
  },
});
app.use(VueQueryPlugin);
app.use(pinia);
app.mount('#app');
