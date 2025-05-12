import NotFound from '../page/NotFound.vue'
import type { RouteRecordRaw } from 'vue-router';
import RegistrationPage from '../pages/RegistrationPage.vue';
import LoginPage from '../pages/LoginPage.vue';

// import example
// import VueComponent from '../components/vuecomponent.vue'

export const ROUTES: RouteRecordRaw[] = [
  // Uncomment after adding a component

  // { path: '/', component: Main },
  { path: '/login', component: LoginPage },
  { path: '/registration', component: RegistrationPage },
  { path: '/:pathMatch(.*)*', component: NotFound }, // Должен всегда быть последним
];
