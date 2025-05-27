import type { RouteRecordRaw } from 'vue-router';

export const ROUTES: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { requiresAuth: false, guestOnly: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login-page/LoginPage.vue'),
    meta: { guestOnly: true, requiresAuth: false },
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('../pages/registration-page/RegistrationPage.vue'),
    meta: { guestOnly: true, requiresAuth: false },
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: () => import('../pages/catalog-page/CatalogPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('../pages/NotFound.vue'),
    meta: { requiresAuth: false, guestOnly: false },
  },
];
