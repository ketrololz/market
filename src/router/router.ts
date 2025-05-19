import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router';
import { ROUTES } from './routes';
import { useAuthStore } from '@/stores/authStore';

export const router = createRouter({
  history: createWebHistory(),
  routes: ROUTES,
});

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore();

    const isLogined = authStore.isUserLoggedIn;

    if (isLogined && (to.name === 'Login' || to.name === 'Registration')) {
      next({ name: 'Home' });
    } else {
      next();
    }
  },
);
