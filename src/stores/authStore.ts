import { defineStore } from 'pinia';
import type { Customer, BaseAddress } from '@commercetools/platform-sdk';
import AuthService from '@/services/authService';
import { ref, computed } from 'vue';
import appLogger from '@/utils/logger';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '@/utils/toaster';
import i18n from '@/plugins/i18n';
import { AuthMessageKey } from '@/localization/i18nKeys';
import { AuthError, ClientValidationError } from '@/services/authErrors';

interface AuthStoreErrorDetails {
  i18nKey: AuthMessageKey | string;
  i18nParams?: Record<string, unknown>;
  code?: string;
  details?: unknown;
  message?: string;
  fieldErrors?: Record<string, string>;
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
  firstName: string;
  lastName: string;
  dateOfBirth: string;
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
  const authErrorMessage = computed(() => currentError.value);

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

    if (err instanceof ClientValidationError) {
      errorPayload = {
        i18nKey: err.i18nKey,
        i18nParams: err.i18nParams,
        code: err.ctpErrorCode || err.name,
        details: err.details,
        fieldErrors: err.yupErrors,
      };
      appLogger.warn(
        `AuthStore ClientValidation Error: (Key: ${err.i18nKey})`,
        err.yupErrors,
      );
    } else if (err instanceof AuthError) {
      errorPayload = {
        i18nKey: err.i18nKey,
        i18nParams: err.i18nParams,
        code: err.ctpErrorCode || err.name,
        details: err.details,
      };
      appLogger.error(
        `AuthStore Error: ${err.name} (Key: ${err.i18nKey}, Code: ${err.ctpErrorCode}) - ${err.message}`,
        err.details || '',
      );
    } else if (err instanceof Error) {
      errorPayload = {
        i18nKey: AuthMessageKey.UnknownError,
        i18nParams: { details: err.message },
        code: 'GenericError',
      };
      appLogger.error(`AuthStore Generic Error: ${err.message}`);
    } else if (typeof err === 'string') {
      errorPayload = {
        i18nKey: AuthMessageKey.UnknownError,
        i18nParams: { details: err },
        code: 'StringError',
      };
      appLogger.error(`AuthStore String Error: ${err}`);
    } else {
      errorPayload = {
        i18nKey: AuthMessageKey.UnknownError,
        message: 'An unknown error occurred.',
        code: 'UnknownErrorInStore',
      };
      appLogger.error('AuthStore Unknown Error Structure:', err);
    }
    currentError.value = errorPayload;
    showErrorToast(
      i18n.global.t(errorPayload.i18nKey, errorPayload.i18nParams || {}),
    );
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
      showSuccessToast(i18n.global.t(AuthMessageKey.LoginSuccess));
      return true;
    } catch (error) {
      if (error instanceof AuthError) setError(error);
      else
        setError(
          new AuthError(AuthMessageKey.LoginFailed, {
            details: error instanceof Error ? error.message : String(error),
          }),
        );
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
      showSuccessToast(i18n.global.t(AuthMessageKey.RegisterSuccess));
      appLogger.log('AuthStore: Login successful.');
      return true;
    } catch (error) {
      if (error instanceof AuthError) setError(error);
      else
        setError(
          new AuthError(AuthMessageKey.RegisterFailed, {
            details: error instanceof Error ? error.message : String(error),
          }),
        );
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
      showInfoToast(i18n.global.t(AuthMessageKey.LogoutSuccess));
    } catch (error) {
      appLogger.error('Error during logout process in store:', error);
      clearUserSession();
      if (error instanceof AuthError) setError(error);
      else
        setError(
          new AuthError(AuthMessageKey.LogoutFailed, {
            details: error instanceof Error ? error.message : String(error),
          }),
        );
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
