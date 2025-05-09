import { defineStore } from 'pinia';

import type { Customer } from '@commercetools/platform-sdk';
import AuthService from '@/services/authService';
import { ref, computed } from 'vue';

export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  // dateOfBirth?: string;
  // addresses?: import('@commercetools/platform-sdk').BaseAddress[];
  // defaultShippingAddress?: number;
  // defaultBillingAddress?: number;
}

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const isLoggedIn = ref(false);
  const user = ref<Customer | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Getters ---
  const getIsLoggedIn = computed(() => isLoggedIn.value);
  const getCurrentUser = computed(() => user.value);
  const getAuthError = computed(() => error.value);
  const isLoadingStatus = computed(() => loading.value);

  // --- Actions ---
  function setLoadingState(newLoading: boolean) {
    loading.value = newLoading;
  }

  function setErrorState(newError: string | null) {
    error.value = newError;
    if (newError) console.error('AuthStore Error (setup):', newError);
  }

  function clearErrorState() {
    error.value = null;
  }

  function setLoggedInState(userData: Customer) {
    user.value = userData;
    isLoggedIn.value = true;
    error.value = null;
    console.log('AuthStore (setup): User logged in', userData);
  }

  function clearAuthState() {
    isLoggedIn.value = false;
    user.value = null;
    error.value = null;
    console.log('AuthStore (setup): Auth state cleared');
  }

  async function login(credentials: {
    email: string;
    password: string;
  }): Promise<boolean> {
    setLoadingState(true);
    clearErrorState();
    try {
      const loggedInUserData = await AuthService.login(
        credentials.email,
        credentials.password,
      );
      setLoggedInState(loggedInUserData);
      return true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorState(e.message);
      }
      clearAuthState();
      return false;
    } finally {
      setLoadingState(false);
    }
  }

  async function register(data: RegistrationData): Promise<boolean> {
    setLoadingState(true);
    clearErrorState();
    try {
      const loggedInUserData = await AuthService.registerAndLogin(data);
      setLoggedInState(loggedInUserData);
      return true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorState(e.message);
      }
      return false;
    } finally {
      setLoadingState(false);
    }
  }

  async function logout() {
    setLoadingState(true);
    try {
      await AuthService.logout();
      clearAuthState();
    } catch (e: unknown) {
      clearAuthState();
      if (e instanceof Error) {
        setErrorState(e.message);
      }
    } finally {
      setLoadingState(false);
    }
  }

  async function checkAuth() {
    console.log('AuthStore (setup): Checking auth state on load...');
    clearErrorState();
    try {
      const userData = await AuthService.checkAuthAndRefresh();
      if (userData) {
        setLoggedInState(userData);
      } else {
        clearAuthState();
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('Check auth failed (setup store):', e);
      }
      clearAuthState();
    }
  }

  return {
    isLoggedIn,
    user,
    loading,
    error,

    getIsLoggedIn,
    getCurrentUser,
    getAuthError,
    isLoadingStatus,

    login,
    register,
    logout,
    checkAuth,
  };
});
