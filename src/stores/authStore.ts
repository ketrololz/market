import { defineStore } from 'pinia';

import type { Customer, BaseAddress } from '@commercetools/platform-sdk';
import AuthService from '@/services/authService';
import { ref, computed } from 'vue';
import { AuthError } from '@/services/authErrors';

interface AuthStoreError {
  message: string;
  code?: string;
}

export interface AddressFormData
  extends Omit<BaseAddress, 'id' | 'key' | 'country'> {
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  shippingAddress: AddressFormData;
  useShippingAsBilling: boolean;
  billingAddress?: AddressFormData;
}

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const isLoggedIn = ref(false);
  const user = ref<Customer | null>(null);
  const loading = ref(false);
  const error = ref<AuthStoreError | null>(null);

  // --- Getters ---
  const getIsLoggedIn = computed(() => isLoggedIn.value);
  const getCurrentUser = computed(() => user.value);
  const getAuthErrorMessage = computed(() => error.value?.message || null);
  const getAuthErrorObject = computed(() => error.value);
  const isLoadingStatus = computed(() => loading.value);

  // --- Actions ---
  function setLoadingState(newLoading: boolean) {
    loading.value = newLoading;
  }

  function setErrorState(err: AuthError | Error | string | null) {
    if (!err) {
      error.value = null;
      return;
    }
    if (err instanceof AuthError) {
      error.value = {
        message: err.message,
        code: err.ctpErrorCode || err.name,
      };
      console.error(
        `AuthStore Error: ${err.name} (Code: ${err.ctpErrorCode}) - ${err.message}`,
        err.details || '',
      );
    } else if (err instanceof Error) {
      error.value = { message: err.message, code: 'GenericError' };
      console.error(`AuthStore Generic Error: ${err.message}`);
    } else if (typeof err === 'string') {
      error.value = { message: err, code: 'StringError' };
      console.error(`AuthStore String Error: ${err}`);
    } else {
      error.value = {
        message: 'Неизвестная ошибка',
        code: 'UnknownErrorInStore',
      };
      console.error('AuthStore Unknown Error Structure:', err);
    }
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
    } catch (error) {
      if (error instanceof AuthError) {
        setErrorState(error);
      } else if (error instanceof Error) {
        setErrorState(new AuthError(error.message));
      } else {
        setErrorState(new AuthError('Неожиданная ошибка при входе.'));
      }
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
    } catch (error) {
      if (error instanceof AuthError) {
        setErrorState(error);
      } else if (error instanceof Error) {
        setErrorState(new AuthError(error.message));
      } else {
        setErrorState(new AuthError('Неожиданная ошибка при регистрации.'));
      }
      return false;
    } finally {
      setLoadingState(false);
    }
  }

  async function logout() {
    setLoadingState(true);
    clearErrorState();
    try {
      await AuthService.logout();
      clearAuthState();
    } catch (error) {
      console.error('Error during logout process in store:', error);
      clearAuthState();
      if (error instanceof AuthError) {
        setErrorState(error);
      } else if (error instanceof Error) {
        setErrorState(new AuthError(error.message));
      } else {
        setErrorState(new AuthError('Ошибка при выходе из системы.'));
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
    } catch (error) {
      console.error('Check auth failed in store:', error);
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
    getAuthErrorMessage,
    getAuthErrorObject,
    isLoadingStatus,

    login,
    register,
    logout,
    checkAuth,
  };
});
