import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import './style.css';
import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);
app.use(PrimeVue);
app.use(VueQueryPlugin);
app.use(pinia);
app.mount('#app');
