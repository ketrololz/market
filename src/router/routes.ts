import NotFound from '../pages/NotFound.vue';
import type { RouteRecordRaw } from 'vue-router';
import RegistrationPage from '../pages/registration-page/RegistrationPage.vue';
import LoginPage from '../pages/login-page/LoginPage.vue';
import HomePage from '@/pages/HomePage.vue';
import CatalogPage from '@/pages/catalog-page/CatalogPage.vue';

export const ROUTES: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => HomePage },
  { path: '/login', name: 'Login', component: () => LoginPage },
  {
    path: '/registration',
    name: 'Registration',
    component: () => RegistrationPage,
  },
  { path: '/catalog', name: 'Catalog', component: () => CatalogPage },
  { path: '/:pathMatch(.*)*', name: '404', component: () => NotFound },
];
