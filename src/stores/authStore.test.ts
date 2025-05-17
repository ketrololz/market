import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  useAuthStore,
  type AddressFormData,
  type LoginData,
  type RegistrationData,
} from './authStore';
import AuthService from '@/services/authService';
import {
  AuthError,
  EmailInUseError,
  InvalidCredentialsError,
} from '@/services/appErrors';
import * as toasterUtils from '@/utils/toaster';
import i18n from '@/plugins/i18n';
import type {
  Customer,
  CustomerSignInResult,
} from '@commercetools/platform-sdk';
import { AuthMessageKey } from '@/localization/i18nKeys';

vi.mock('@/services/authService');
vi.mock('@/utils/logger', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
vi.mock('@/utils/toaster');
vi.mock('@/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key: string, params?: Record<string, unknown>) => {
        if (params && Object.keys(params).length > 0) {
          return `${key}_with_${Object.values(params).join('_')}`;
        }
        return key;
      }),
    },
  },
}));

const MockAuthService = vi.mocked(AuthService);

describe('authStore', () => {
  let store: ReturnType<typeof useAuthStore>;

  const mockCustomer: Customer = {
    id: 'user-123',
    version: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: 'date',
    lastModifiedAt: 'date',
    addresses: [],
    isEmailVerified: false,
    stores: [],
    authenticationMode: 'ExternalAuth',
  };
  const mockCustomerSignInResult: CustomerSignInResult = {
    customer: mockCustomer,
  };
  const mockLoginData: LoginData = {
    email: 'test@example.com',
    password: 'password',
  };
  const mockAddress: AddressFormData = {
    streetName: '1 Main St',
    city: 'Testville',
    postalCode: '12345',
    country: 'US',
  };
  const mockRegistrationData: RegistrationData = {
    email: 'new@example.com',
    password: 'newPassword',
    firstName: 'New',
    lastName: 'User',
    shippingAddress: mockAddress,
    useShippingAsBilling: true,
    dateOfBirth: '2000-01-01',
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAuthStore();
    vi.clearAllMocks();
  });

  it('initial state is correct', () => {
    expect(store.user).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.currentError).toBeNull();
    expect(store.isUserLoggedIn).toBe(false);
  });

  describe('login action', () => {
    it('should set user session and show success toast on successful login', async () => {
      MockAuthService.login.mockResolvedValue(mockCustomer);

      const result = await store.login(mockLoginData);

      expect(AuthService.login).toHaveBeenCalledWith(mockLoginData);
      expect(store.userProfile).toEqual(mockCustomer);
      expect(store.isUserLoggedIn).toBe(true);
      expect(store.currentError).toBeNull();
      expect(toasterUtils.showSuccessToast).toHaveBeenCalledWith(
        i18n.global.t(AuthMessageKey.LoginSuccess),
      );
      expect(result).toBe(true);
    });

    it('should set error and show error toast on failed login (AuthError)', async () => {
      const authError = new AuthError(AuthMessageKey.LoginInvalidCredentials);
      MockAuthService.login.mockRejectedValue(authError);

      const result = await store.login(mockLoginData);

      expect(store.userProfile).toBeNull();
      expect(store.isUserLoggedIn).toBe(false);
      expect(store.authErrorDetails).toEqual({
        i18nKey: authError.i18nKey,
        i18nParams: authError.i18nParams,
        code: authError.name,
        details: authError.details,
      });
      expect(toasterUtils.showErrorToast).toHaveBeenCalledWith(
        i18n.global.t(authError.i18nKey),
      );
      expect(result).toBe(false);
    });

    it('should handle generic Error on failed login', async () => {
      const genericError = new Error('Network issue');
      MockAuthService.login.mockRejectedValue(genericError);

      const result = await store.login(mockLoginData);
      expect(store.authErrorDetails?.i18nKey).toBe(AuthMessageKey.LoginFailed);
      expect(toasterUtils.showErrorToast).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('register action', () => {
    it('should set user session and show success toast on successful registration and login', async () => {
      MockAuthService.register.mockResolvedValue(mockCustomerSignInResult);
      MockAuthService.login.mockResolvedValue({
        ...mockCustomer,
        email: mockRegistrationData.email,
      });

      const result = await store.register(mockRegistrationData);

      expect(AuthService.register).toHaveBeenCalledWith(mockRegistrationData);
      expect(AuthService.login).toHaveBeenCalledWith({
        email: mockRegistrationData.email,
        password: mockRegistrationData.password,
      });
      expect(store.userProfile?.email).toBe(mockRegistrationData.email);
      expect(store.isUserLoggedIn).toBe(true);
      expect(toasterUtils.showSuccessToast).toHaveBeenCalledWith(
        i18n.global.t(AuthMessageKey.RegisterSuccess),
      );
      expect(result).toBe(true);
    });

    it('should set error if AuthService.register fails', async () => {
      const regError = new EmailInUseError();
      MockAuthService.register.mockRejectedValue(regError);

      const result = await store.register(mockRegistrationData);

      expect(AuthService.login).not.toHaveBeenCalled();
      expect(store.authErrorDetails?.i18nKey).toBe(regError.i18nKey);
      expect(result).toBe(false);
    });

    it('should set error if auto-login after registration fails', async () => {
      MockAuthService.register.mockResolvedValue(mockCustomerSignInResult);
      const loginError = new InvalidCredentialsError();
      MockAuthService.login.mockRejectedValue(loginError);

      const result = await store.register(mockRegistrationData);

      expect(store.authErrorDetails?.i18nKey).toBe(loginError.i18nKey);
      expect(result).toBe(false);
    });
  });

  describe('logout action', () => {
    it('should clear user session and show info toast', async () => {
      store.user = mockCustomer;
      MockAuthService.logout.mockResolvedValue(undefined);
      await store.logout();
      expect(AuthService.logout).toHaveBeenCalled();
      expect(store.userProfile).toBeNull();
      expect(store.isUserLoggedIn).toBe(false);
      expect(store.currentError).toBeNull();
      expect(toasterUtils.showInfoToast).toHaveBeenCalledWith(
        i18n.global.t(AuthMessageKey.LogoutSuccess),
      );
    });
  });

  describe('restoreUserSession action', () => {
    it('should set user session if AuthService.restoreSession returns user data', async () => {
      MockAuthService.restoreSession.mockResolvedValue(mockCustomer);

      await store.restoreUserSession();

      expect(AuthService.restoreSession).toHaveBeenCalled();
      expect(store.userProfile).toEqual(mockCustomer);
      expect(store.isUserLoggedIn).toBe(true);
    });

    it('should clear auth state if AuthService.restoreSession returns null', async () => {
      MockAuthService.restoreSession.mockResolvedValue(null);
      store.user = mockCustomer;

      await store.restoreUserSession();

      expect(store.userProfile).toBeNull();
      expect(store.isUserLoggedIn).toBe(false);
    });
  });
});
