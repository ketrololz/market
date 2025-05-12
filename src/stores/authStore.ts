import { defineStore } from 'pinia';

import type { Customer, BaseAddress } from '@commercetools/platform-sdk';
import AuthService from '@/services/authService';
import { ref, computed } from 'vue';
import { AuthError } from '@/services/authErrors';
import appLogger from '@/utils/logger';

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
      appLogger.error(
        `AuthStore Error: ${err.name} (Code: ${err.ctpErrorCode}) - ${err.message}`,
        err.details || '',
      );
    } else if (err instanceof Error) {
      error.value = { message: err.message, code: 'GenericError' };
      appLogger.error(`AuthStore Generic Error: ${err.message}`);
    } else if (typeof err === 'string') {
      error.value = { message: err, code: 'StringError' };
      appLogger.error(`AuthStore String Error: ${err}`);
    } else {
      error.value = {
        message: 'Unknown error',
        code: 'UnknownErrorInStore',
      };
      appLogger.error('AuthStore Unknown Error Structure:', err);
    }
  }

  function clearErrorState() {
    error.value = null;
  }

  function setLoggedInState(userData: Customer) {
    user.value = userData;
    isLoggedIn.value = true;
    error.value = null;
    appLogger.log('AuthStore (setup): User logged in', userData);
  }

  function clearAuthState() {
    isLoggedIn.value = false;
    user.value = null;
    error.value = null;
    appLogger.log('AuthStore (setup): Auth state cleared');
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
        setErrorState(new AuthError('Unexpected error during login.'));
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
      const registrationResult = await AuthService.register(data);
      if (!registrationResult || !registrationResult.customer) {
        setErrorState(
          new AuthError(
            'Registration succeeded, but failed to retrieve user data for auto-login.',
          ),
        );
        return false;
      }
      appLogger.log(
        'AuthStore: Registration successful. Proceeding to auto-login...',
      );
      const loggedInUserData = await AuthService.login(
        data.email,
        data.password,
      );
      setLoggedInState(loggedInUserData);
      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        setErrorState(error);
      } else if (error instanceof Error) {
        setErrorState(new AuthError(error.message));
      } else {
        setErrorState(new AuthError('Unexpected error during registration.'));
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
      appLogger.error('Error during logout process in store:', error);
      clearAuthState();
      if (error instanceof AuthError) {
        setErrorState(error);
      } else if (error instanceof Error) {
        setErrorState(new AuthError(error.message));
      } else {
        setErrorState(new AuthError('Error during logout process.'));
      }
    } finally {
      setLoadingState(false);
    }
  }

  async function tryRestoreSessionOnLoad() {
    appLogger.log('AuthStore (setup): Checking auth state on load...');
    clearErrorState();
    try {
      const userData = await AuthService.restoreSession();
      if (userData) {
        setLoggedInState(userData);
      } else {
        clearAuthState();
      }
    } catch (error) {
      appLogger.error('Check auth failed in store:', error);
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
    checkAuth: tryRestoreSessionOnLoad,
  };
});
