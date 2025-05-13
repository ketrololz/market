import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { router } from './router/router';
import './style.css';
import App from './App.vue';
import Toast, { type PluginOptions, POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { MAIN_THEME } from './theme/main-theme';

const pinia = createPinia();
const app = createApp(App);

const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
};

app
  .use(PrimeVue, {
    theme: {
      preset: MAIN_THEME,
      options: {
        darkModeSelector: false,
      },
    },
  })
  .use(VueQueryPlugin)
  .use(pinia)
  .use(router)
  .use(Toast, toastOptions)
  .mount('#app');
