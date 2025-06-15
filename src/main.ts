import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { router } from './router/router';
import './style.css';
import App from './App.vue';
import 'vue-toastification/dist/index.css';
import { MAIN_THEME } from './theme/main-theme';
import { toastOptions } from './plugins/toastification';
import toast from 'vue-toastification';
import i18n from './plugins/i18n';
import ConfirmationService from 'primevue/confirmationservice';

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
  .use(i18n)
  .use(router)
  .use(toast, toastOptions)
  .use(ConfirmationService)
  .mount('#app');
