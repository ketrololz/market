import type { RouteRecordRaw } from 'vue-router';

export const ROUTES: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('../pages/HomePage.vue') },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login-page/LoginPage.vue'),
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('../pages/registration-page/RegistrationPage.vue'),
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: () => import('../pages/catalog-page/CatalogPage.vue'),
  },
  {
    path: '/catalog/:category/',
    name: 'CatalogCategory',
    component: () => import('../components/shop-view/ShopView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('../pages/NotFound.vue'),
  },
];
