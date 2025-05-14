import { defineStore } from 'pinia';
import type { Customer, BaseAddress } from '@commercetools/platform-sdk';
import AuthService from '@/services/authService';
import { ref, computed } from 'vue';
import { AuthError } from '@/services/authErrors';
import appLogger from '@/utils/logger';
import { showErrorToast, showSuccessToast } from '@/utils/toaster';

interface AuthStoreErrorDetails {
  message: string;
  code?: string;
  details?: unknown;
}

export interface AddressFormData
  extends Omit<BaseAddress, 'id' | 'key' | 'country'> {
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
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
  const user = ref<Customer | null>(null);
  const isLoading = ref(false);
  const currentError = ref<AuthStoreErrorDetails | null>(null);

  // --- Getters ---
  const isUserLoggedIn = computed(() => !!user.value);
  const userProfile = computed(() => user.value);
  const authErrorDetails = computed(() => currentError.value);
  const authErrorMessage = computed(() => currentError.value?.message || null);

  // --- Actions ---
  const setLoading = (loadingState: boolean): void => {
    isLoading.value = loadingState;
  };

  const setError = (err: AuthError | Error | string | null): void => {
    if (!err) {
      currentError.value = null;
      return;
    }
    let errorPayload: AuthStoreErrorDetails;
    if (err instanceof AuthError) {
      errorPayload = {
        message: err.message,
        code: err.ctpErrorCode || err.name,
        details: err.details,
      };
      appLogger.error(
        `AuthStore Error: ${err.name} (Code: ${err.ctpErrorCode}) - ${err.message}`,
        err.details || '',
      );
    } else if (err instanceof Error) {
      errorPayload = { message: err.message, code: 'GenericError' };
      appLogger.error(`AuthStore Generic Error: ${err.message}`);
    } else if (typeof err === 'string') {
      errorPayload = { message: err, code: 'StringError' };
      appLogger.error(`AuthStore String Error: ${err}`);
    } else {
      errorPayload = {
        message: 'An unknown error occurred in the store.',
        code: 'UnknownErrorInStore',
      };
      appLogger.error('AuthStore Unknown Error Structure:', err);
    }
    currentError.value = errorPayload;
    showErrorToast(errorPayload.message);
  };

  const clearError = (): void => {
    currentError.value = null;
  };

  const setUserSession = (userData: Customer): void => {
    user.value = userData;
    currentError.value = null;
    appLogger.log('AuthStore: User session established.', userData);
  };

  const clearUserSession = (): void => {
    user.value = null;
    currentError.value = null;
    appLogger.log('AuthStore: User session cleared.');
  };

  async function login(credentials: LoginData): Promise<boolean> {
    setLoading(true);
    clearError();
    try {
      const loggedInUserData = await AuthService.login(credentials);
      setUserSession(loggedInUserData);
      showSuccessToast('Login successful! Welcome back.');
      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error);
      } else if (error instanceof Error) {
        setError(new AuthError(error.message));
      } else {
        setError(new AuthError('Unexpected error during login.'));
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function register(data: RegistrationData): Promise<boolean> {
    setLoading(true);
    clearError();
    try {
      const registrationResult = await AuthService.register(data);
      if (!registrationResult || !registrationResult.customer) {
        setError(
          new AuthError(
            'Registration succeeded, but failed to retrieve user data for auto-login.',
          ),
        );
        return false;
      }
      appLogger.log(
        'AuthStore: Registration successful. Proceeding to auto-login...',
      );
      const loggedInUserData = await AuthService.login({
        email: data.email,
        password: data.password,
      });
      setUserSession(loggedInUserData);
      showSuccessToast('Registration successful! You are now logged in.');
      appLogger.log('AuthStore: Login successful.');
      return true;
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error);
      } else if (error instanceof Error) {
        setError(new AuthError(error.message));
      } else {
        setError(new AuthError('Unexpected error during registration.'));
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout(): Promise<void> {
    setLoading(true);
    clearError();
    try {
      await AuthService.logout();
      clearUserSession();
    } catch (error) {
      appLogger.error('Error during logout process in store:', error);
      clearUserSession();
      if (error instanceof AuthError) {
        setError(error);
      } else if (error instanceof Error) {
        setError(new AuthError(error.message));
      } else {
        setError(new AuthError('Error during logout process.'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function restoreUserSession() {
    appLogger.log('AuthStore: Attempting to restore session on load...');
    clearError();
    try {
      const userData = await AuthService.restoreSession();
      if (userData) {
        setUserSession(userData);
      } else {
        clearUserSession();
      }
    } catch (error) {
      appLogger.error('AuthStore: Failed to restore session.', error);
      clearUserSession();
    }
  }

  return {
    user,
    isLoading,
    currentError,

    isUserLoggedIn,
    userProfile,
    authErrorDetails,
    authErrorMessage,

    login,
    register,
    logout,
    restoreUserSession,
    clearError,
  };
});
