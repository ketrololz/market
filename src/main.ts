import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { router } from './router/router';
import './style.css';
import App from './App.vue';
import { MAIN_THEME } from './theme/main-theme';

const pinia = createPinia();
const app = createApp(App);

app
  .use(PrimeVue, {
    theme: {
      preset: MAIN_THEME,
      options: {
        darkModeSelector: false,
      },
    },
    locale: {
      dateFormat: 'yy-mm-dd',
    },
  })
  .use(VueQueryPlugin)
  .use(pinia)
  .use(router)
  .mount('#app');
