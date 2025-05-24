import NotFound from '../pages/NotFound.vue';
import type { RouteRecordRaw } from 'vue-router';
import RegistrationPage from '../pages/registration-page/RegistrationPage.vue';
import LoginPage from '../pages/login-page/LoginPage.vue';
import HomePage from '@/pages/HomePage.vue';

export const ROUTES: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: false, guestOnly: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guestOnly: true, requiresAuth: false },
  },
  {
    path: '/registration',
    name: 'Registration',
    component: RegistrationPage,
    meta: { guestOnly: true, requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: NotFound,
    meta: { requiresAuth: false, guestOnly: false },
  },
];
