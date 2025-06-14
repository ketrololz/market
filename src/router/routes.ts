import type { RouteRecordRaw } from 'vue-router';

export const ROUTES: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
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
    path: '/product/:identifier', // identifier can be id (6f233a30-edcd-4381-b696-4001efb2a4a6), key (0003), or slug (exploding-kittens || vzryvnye-kotyata")
    name: 'Product',
    component: () => import('../pages/product-page/ProductPage.vue'),
    props: true,
    meta: { requiresAuth: false, guestOnly: false },
  },
  {
    path: '/catalog/:category/',
    name: 'CatalogCategory',
    component: () => import('../components/shop-view/ShopView.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/profile-page/ProfilePage.vue'),
    meta: { requiresAuth: true, guestOnly: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('../pages/NotFound.vue'),
  },
];
