import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

async function logout() {
  const authStore = useAuthStore();
  await authStore.logout();
}

export const USER_NAV_LINKS = computed(() => {
  const authStore = useAuthStore();
  if (authStore.isUserLoggedIn) {
    return [
      {
        label: 'Logout',
        route: '/',
        command: logout,
        icon: 'pi pi-sign-out',
      },
    ];
  }

  return [
    {
      label: 'Login',
      route: '/login',
      icon: 'pi pi-sign-in',
    },
    {
      label: 'Sign up',
      route: '/registration',
      icon: 'pi pi-user-plus',
    },
  ];
});
