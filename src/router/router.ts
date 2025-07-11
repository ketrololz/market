import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router';
import { ROUTES } from './routes';
import { useAuthStore } from '@/stores/authStore';
import appLogger from '@/utils/logger';

export const router = createRouter({
  history: createWebHistory(),
  routes: ROUTES,
});

let authInitialized = false;

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore();

    if (!authInitialized) {
      try {
        await authStore.restoreUserSession();
      } catch (error) {
        appLogger.error(
          'Error during initial auth state initialization:',
          error,
        );
      }
      authInitialized = true;
    }

    const isAuthenticated = authStore.isUserLoggedIn;

    if (to.meta.requiresAuth && !isAuthenticated) {
      appLogger.log(
        `Navigation Guard: Route [${String(to.name)}] requires auth, user not authenticated. Redirecting to Login.`,
      );
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (to.meta.guestOnly && isAuthenticated) {
      appLogger.log(
        `Navigation Guard: Route [${String(to.name)}] is guestOnly, user IS authenticated. Redirecting to Home.`,
      );
      next({ name: 'Home' });
    } else {
      appLogger.log(
        `Navigation Guard: Allowing navigation to [${String(to.name)}]. Auth: ${isAuthenticated}`,
      );
      next();
    }
  },
);
