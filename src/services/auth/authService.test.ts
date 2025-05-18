import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CtpClientFactory } from '@/api/ctpClientBuilderFactory';
import {
  userTokenCache,
  anonymousTokenCache,
  getStoredAnonymousId,
  clearStoredAnonymousId,
} from '@/api/localStorageTokenCache';
import * as authErrors from '../appErrors';
import { loginSchema } from '@/schemas/loginSchema';
import { registrationSchema } from '@/schemas/registrationSchema';
import { v4 as uuidv4 } from 'uuid';
import type {
  Customer,
  CustomerSignInResult,
} from '@commercetools/platform-sdk';
import type {
  LoginData,
  RegistrationData,
  AddressFormData,
} from '@/stores/authStore';
import { clientId, clientSecret } from '@/api/ctpConfig';
import { AuthService } from './authService';

vi.mock('@/utils/logger', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@/api/localStorageTokenCache', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    userTokenCache: { get: vi.fn(), set: vi.fn(), clear: vi.fn() },
    anonymousTokenCache: { get: vi.fn(), set: vi.fn(), clear: vi.fn() },
    getStoredAnonymousId: vi.fn(),
    setStoredAnonymousId: vi.fn(),
    clearStoredAnonymousId: vi.fn(),
  };
});

const mockApiRoot = {
  me: vi.fn().mockReturnThis(),
  login: vi.fn().mockReturnThis(),
  signup: vi.fn().mockReturnThis(),
  get: vi.fn().mockReturnThis(),
  post: vi.fn().mockReturnThis(),
  execute: vi.fn(),
};
vi.mock('@/api/ctpClientBuilderFactory', () => ({
  CtpClientFactory: {
    createAppApiRoot: vi.fn(() => mockApiRoot),
    createPasswordFlowApiRoot: vi.fn(() => mockApiRoot),
    createAnonymousFlowApiRoot: vi.fn(() => mockApiRoot),
    createRefreshTokenFlowApiRoot: vi.fn(() => mockApiRoot),
  },
}));

vi.spyOn(authErrors, 'parseError').mockImplementation((err: unknown) => {
  if (err instanceof authErrors.AuthError) {
    return err;
  }
  if (err instanceof Error) {
    return new authErrors.AuthError(
      err.message || 'Parsed mock error from generic Error',
      { details: { originalError: err } },
    );
  }
  return new authErrors.AuthError('Parsed mock error from unknown source', {
    details: { rawError: err },
  });
});

vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

vi.mock('@/schemas/loginSchema', () => ({
  loginSchema: { validate: vi.fn() },
}));
vi.mock('@/schemas/registrationSchema', () => ({
  registrationSchema: { validate: vi.fn() },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockBtoa = vi.fn((str) => `encoded:${str}`);
vi.stubGlobal('btoa', mockBtoa);

describe('AuthService', () => {
  let authService: AuthService;

  const mockLoginData: LoginData = {
    email: 'test@example.com',
    password: 'password123',
  };
  const mockShippingAddress: AddressFormData = {
    streetName: '123 Main',
    city: 'Testville',
    postalCode: '12345',
    country: 'US',
    isDefaultShipping: true,
  };
  const mockBillingAddress: AddressFormData = {
    streetName: '123 Main',
    city: 'Testville',
    postalCode: '12345',
    country: 'US',
    isDefaultBilling: true,
  };
  const mockRegistrationData: RegistrationData = {
    email: 'new@example.com',
    password: 'newPassword123',
    firstName: 'New',
    lastName: 'User',
    shippingAddress: mockShippingAddress,
    sameAsShipping: true,
    dateOfBirth: '1990-01-01',
    billingAddress: mockBillingAddress,
  };
  const mockCustomer: Customer = {
    id: 'user-id',
    version: 1,
    email: 'test@example.com',
    createdAt: '',
    lastModifiedAt: '',
    addresses: [],
    isEmailVerified: false,
    stores: [],
    authenticationMode: 'Password',
  };
  const mockCustomerSignInResult: CustomerSignInResult = {
    customer: mockCustomer,
    cart: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (uuidv4 as ReturnType<typeof vi.fn>).mockReturnValue('mock-anonymous-id');
    (loginSchema.validate as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockLoginData,
    );
    (registrationSchema.validate as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockRegistrationData,
    );
    (userTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValue({
      token: '',
      expirationTime: 0,
    });
    (anonymousTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValue({
      token: '',
      expirationTime: 0,
    });
    (getStoredAnonymousId as ReturnType<typeof vi.fn>).mockReturnValue(null);

    authService = new AuthService();
  });

  describe('login', () => {
    it('should successfully login a user and return customer data', async () => {
      (mockApiRoot.execute as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ body: mockCustomerSignInResult })
        .mockResolvedValueOnce({ body: mockCustomer });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'user-access',
          refresh_token: 'user-refresh',
        }),
      });

      const customer = await authService.login(mockLoginData);

      expect(CtpClientFactory.createAnonymousFlowApiRoot).toHaveBeenCalled();
      expect(mockApiRoot.me).toHaveBeenCalled();
      expect(mockApiRoot.login).toHaveBeenCalled();
      expect(mockApiRoot.post).toHaveBeenCalledWith({
        body: expect.objectContaining({ email: mockLoginData.email }),
      });
      expect(anonymousTokenCache.clear).toHaveBeenCalled();
      expect(clearStoredAnonymousId).toHaveBeenCalled();
      expect(CtpClientFactory.createPasswordFlowApiRoot).toHaveBeenCalledWith(
        mockLoginData,
      );
      expect(userTokenCache.clear).toHaveBeenCalledTimes(2);
      expect(customer).toEqual(mockCustomer);
    });

    it('should throw parsed CTP error on /me/login failure', async () => {
      const ctpError = {
        statusCode: 400,
        body: { message: 'CTP /me/login error', error: 'invalid_grant' },
      };
      (mockApiRoot.execute as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        ctpError,
      );
      (authErrors.parseError as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        new authErrors.InvalidCredentialsError(),
      );

      await expect(authService.login(mockLoginData)).rejects.toThrow(
        authErrors.InvalidCredentialsError,
      );
      expect(authErrors.parseError).toHaveBeenCalledWith(ctpError);
      expect(userTokenCache.clear).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should successfully register a user and return CustomerSignInResult', async () => {
      (mockApiRoot.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        body: mockCustomerSignInResult,
      });

      const result = await authService.register(mockRegistrationData);

      expect(CtpClientFactory.createAnonymousFlowApiRoot).toHaveBeenCalled();
      expect(mockApiRoot.me).toHaveBeenCalled();
      expect(mockApiRoot.signup).toHaveBeenCalled();
      expect(mockApiRoot.post).toHaveBeenCalledWith({
        body: expect.objectContaining({ email: mockRegistrationData.email }),
      });
      expect(anonymousTokenCache.clear).toHaveBeenCalled();
      expect(clearStoredAnonymousId).toHaveBeenCalled();
      expect(result).toEqual(mockCustomerSignInResult);
    });
  });

  describe('logout', () => {
    it('should clear user token cache and attempt to revoke token', async () => {
      (userTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        refreshToken: 'user-refresh-token',
        token: 'user-access-token',
        expirationTime: 0,
      });
      mockFetch.mockResolvedValueOnce({ ok: true });

      await authService.logout();

      expect(userTokenCache.clear).toHaveBeenCalled();
      expect(anonymousTokenCache.clear).toHaveBeenCalled();
      expect(clearStoredAnonymousId).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/oauth/token/revoke'),
        expect.anything(),
      );
      expect(mockBtoa).toHaveBeenCalledWith(`${clientId}:${clientSecret}`);
    });
  });

  describe('restoreSession', () => {
    it('should return null if no refresh token is found', async () => {
      (userTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        token: '',
        expirationTime: 0,
      });
      const customer = await authService.restoreSession();
      expect(customer).toBeNull();
    });

    it('should restore session and return customer if refresh token is valid', async () => {
      (userTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        refreshToken: 'valid-refresh-token',
        token: '',
        expirationTime: 0,
      });
      (mockApiRoot.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        body: mockCustomer,
      });

      const customer = await authService.restoreSession();

      expect(
        CtpClientFactory.createRefreshTokenFlowApiRoot,
      ).toHaveBeenCalledWith('valid-refresh-token', userTokenCache);
      expect(mockApiRoot.me).toHaveBeenCalled();
      expect(mockApiRoot.get).toHaveBeenCalled();
      expect(customer).toEqual(mockCustomer);
    });

    it('should clear cache and return null if refresh token is invalid', async () => {
      (userTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        refreshToken: 'invalid-refresh-token',
        token: '',
        expirationTime: 0,
      });
      (mockApiRoot.execute as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Refresh failed'),
      );

      const customer = await authService.restoreSession();

      expect(userTokenCache.clear).toHaveBeenCalled();
      expect(customer).toBeNull();
    });
  });
});
