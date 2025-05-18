import { createRouter, createWebHistory } from 'vue-router';
import { ROUTES } from './routes';

export const router = createRouter({
  history: createWebHistory(),
  routes: ROUTES,
});
