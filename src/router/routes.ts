import NotFound from '../pages/NotFound.vue';
import type { RouteRecordRaw } from 'vue-router';
import RegistrationPage from '../pages/RegistrationPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import HomePage from '@/pages/HomePage.vue';

// import example
// import VueComponent from '../components/vuecomponent.vue'

export const ROUTES: RouteRecordRaw[] = [
  // Uncomment after adding a component

  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/registration', component: RegistrationPage },
  { path: '/:pathMatch(.*)*', name: '404', component: NotFound }, // Должен всегда быть последним
];
