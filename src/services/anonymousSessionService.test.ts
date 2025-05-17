import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnonymousSessionService as AnonymousSessionServiceClass } from './anonymousSessionService';
import { CtpClientFactory } from '@/api/ctpClientBuilderFactory';
import {
  anonymousTokenCache,
  getStoredAnonymousId,
  setStoredAnonymousId,
  clearStoredAnonymousId,
} from '@/api/localStorageTokenCache';
import * as authErrors from './appErrors';
import { v4 as uuidv4 } from 'uuid';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';

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
    anonymousTokenCache: { get: vi.fn(), set: vi.fn(), clear: vi.fn() },
    getStoredAnonymousId: vi.fn(),
    setStoredAnonymousId: vi.fn(),
    clearStoredAnonymousId: vi.fn(),
  };
});

const mockAnonApiRoot = {
  get: vi.fn().mockReturnThis(),
  execute: vi.fn(),
} as unknown as ByProjectKeyRequestBuilder;
vi.mock('@/api/ctpClientBuilderFactory', () => ({
  CtpClientFactory: {
    createAnonymousFlowApiRoot: vi.fn(() => mockAnonApiRoot),
    createRefreshTokenFlowApiRoot: vi.fn(() => mockAnonApiRoot),
  },
}));

vi.spyOn(authErrors, 'parseError').mockImplementation((err: unknown) => {
  if (err instanceof authErrors.AuthError) {
    return err;
  }
  if (err instanceof Error) {
    return new authErrors.AuthError(
      err.message || 'Parsed mock error from generic Error',
      { details: { originalError: err }, ctpErrorCode: 'MockedGenericError' },
    );
  }
  return new authErrors.AuthError('Parsed mock error from unknown source', {
    details: { rawError: err },
    ctpErrorCode: 'MockedUnknownSourceError',
  });
});

vi.mock('uuid', () => ({ v4: vi.fn() }));

describe('AnonymousSessionService', () => {
  let serviceInstance: AnonymousSessionServiceClass;

  const MOCK_ANONYMOUS_ID = 'mock-anon-id-123';
  const MOCK_NEW_ANONYMOUS_ID = 'new-mock-anon-id-456';
  const MOCK_REFRESH_TOKEN = 'mock-refresh-token';

  beforeEach(() => {
    vi.clearAllMocks();
    (getStoredAnonymousId as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (anonymousTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValue({
      token: '',
      refreshToken: undefined,
      expirationTime: 0,
    });
    (uuidv4 as ReturnType<typeof vi.fn>).mockReturnValue(MOCK_NEW_ANONYMOUS_ID);

    serviceInstance = new AnonymousSessionServiceClass();
  });

  describe('ensureSession', () => {
    it('should create a new session if no existing ID or refresh token is found', async () => {
      const session = await serviceInstance.ensureSession();

      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(setStoredAnonymousId).toHaveBeenCalledWith(MOCK_NEW_ANONYMOUS_ID);
      expect(CtpClientFactory.createAnonymousFlowApiRoot).toHaveBeenCalledWith(
        MOCK_NEW_ANONYMOUS_ID,
      );
      expect(session).toEqual({
        apiRoot: mockAnonApiRoot,
        anonymousId: MOCK_NEW_ANONYMOUS_ID,
      });
      expect(serviceInstance.getCurrentAnonymousId()).toBe(
        MOCK_NEW_ANONYMOUS_ID,
      );
    });

    it('should attempt to refresh an existing session if ID and refresh token are present', async () => {
      (getStoredAnonymousId as ReturnType<typeof vi.fn>).mockReturnValue(
        MOCK_ANONYMOUS_ID,
      );
      (anonymousTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValue({
        token: 'old-access',
        refreshToken: MOCK_REFRESH_TOKEN,
        expirationTime: 0,
      });
      (
        CtpClientFactory.createRefreshTokenFlowApiRoot as ReturnType<
          typeof vi.fn
        >
      ).mockReturnValue(mockAnonApiRoot);

      const session = await serviceInstance.ensureSession();

      expect(
        CtpClientFactory.createRefreshTokenFlowApiRoot,
      ).toHaveBeenCalledWith(MOCK_REFRESH_TOKEN, anonymousTokenCache);
      expect(
        CtpClientFactory.createAnonymousFlowApiRoot,
      ).not.toHaveBeenCalled();
      expect(session).toEqual({
        apiRoot: mockAnonApiRoot,
        anonymousId: MOCK_ANONYMOUS_ID,
      });
      expect(serviceInstance.getCurrentAnonymousId()).toBe(MOCK_ANONYMOUS_ID);
    });

    it('should create a new session if refreshing an existing session fails', async () => {
      (getStoredAnonymousId as ReturnType<typeof vi.fn>).mockReturnValue(
        MOCK_ANONYMOUS_ID,
      );
      (anonymousTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValue({
        token: 'old-access',
        refreshToken: MOCK_REFRESH_TOKEN,
        expirationTime: 0,
      });
      (
        CtpClientFactory.createRefreshTokenFlowApiRoot as ReturnType<
          typeof vi.fn
        >
      ).mockImplementation(() => {
        throw new Error('Refresh failed');
      });

      const session = await serviceInstance.ensureSession();

      expect(
        CtpClientFactory.createRefreshTokenFlowApiRoot,
      ).toHaveBeenCalledWith(MOCK_REFRESH_TOKEN, anonymousTokenCache);
      expect(anonymousTokenCache.clear).toHaveBeenCalledTimes(1);
      expect(clearStoredAnonymousId).toHaveBeenCalledTimes(1);
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(setStoredAnonymousId).toHaveBeenCalledWith(MOCK_NEW_ANONYMOUS_ID);
      expect(CtpClientFactory.createAnonymousFlowApiRoot).toHaveBeenCalledWith(
        MOCK_NEW_ANONYMOUS_ID,
      );
      expect(session).toEqual({
        apiRoot: mockAnonApiRoot,
        anonymousId: MOCK_NEW_ANONYMOUS_ID,
      });
    });

    it('should clear incomplete session data and create a new session', async () => {
      (getStoredAnonymousId as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        MOCK_ANONYMOUS_ID,
      );
      (anonymousTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        { token: 'some-token', refreshToken: undefined, expirationTime: 0 },
      );

      let session = await serviceInstance.ensureSession();
      expect(clearStoredAnonymousId).toHaveBeenCalledTimes(1);
      expect(anonymousTokenCache.clear).toHaveBeenCalledTimes(1);
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(setStoredAnonymousId).toHaveBeenCalledWith(MOCK_NEW_ANONYMOUS_ID);
      expect(CtpClientFactory.createAnonymousFlowApiRoot).toHaveBeenCalledWith(
        MOCK_NEW_ANONYMOUS_ID,
      );
      expect(session?.anonymousId).toBe(MOCK_NEW_ANONYMOUS_ID);

      vi.clearAllMocks();
      (uuidv4 as ReturnType<typeof vi.fn>).mockReturnValue('another-new-id');

      (getStoredAnonymousId as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        null,
      );
      (anonymousTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        {
          token: 'some-token',
          refreshToken: 'some-refresh',
          expirationTime: 0,
        },
      );
      (uuidv4 as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        'another-new-id',
      );

      session = await serviceInstance.ensureSession();
      expect(anonymousTokenCache.clear).toHaveBeenCalledTimes(1);
      expect(clearStoredAnonymousId).toHaveBeenCalledTimes(1);
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(setStoredAnonymousId).toHaveBeenCalledWith('another-new-id');
      expect(CtpClientFactory.createAnonymousFlowApiRoot).toHaveBeenCalledWith(
        'another-new-id',
      );
      expect(session?.anonymousId).toBe('another-new-id');
    });

    it('should throw parsed error if creating new session fails', async () => {
      (getStoredAnonymousId as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (anonymousTokenCache.get as ReturnType<typeof vi.fn>).mockReturnValue({
        token: '',
        refreshToken: undefined,
        expirationTime: 0,
      });

      const creationError = new Error('Failed to create anon client');
      (
        CtpClientFactory.createAnonymousFlowApiRoot as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw creationError;
      });
      const parsedErrorInstance = new authErrors.AuthError('parsed error');
      (authErrors.parseError as ReturnType<typeof vi.fn>).mockReturnValue(
        parsedErrorInstance,
      );

      await expect(serviceInstance.ensureSession()).rejects.toThrow(
        parsedErrorInstance,
      );
      expect(authErrors.parseError).toHaveBeenCalledWith(creationError);
      expect(clearStoredAnonymousId).toHaveBeenCalledTimes(1);
      expect(anonymousTokenCache.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearData', () => {
    it('should call anonymousTokenCache.clear and clearStoredAnonymousId', () => {
      serviceInstance.clearData();
      expect(anonymousTokenCache.clear).toHaveBeenCalledTimes(1);
      expect(clearStoredAnonymousId).toHaveBeenCalledTimes(1);
      expect(serviceInstance.getCurrentAnonymousId()).toBeNull();
    });
  });

  describe('getCurrentAnonymousId', () => {
    it('should return null if no ID is set or stored', () => {
      const newServiceInstance = new AnonymousSessionServiceClass();
      (getStoredAnonymousId as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(newServiceInstance.getCurrentAnonymousId()).toBeNull();
    });
  });
});
