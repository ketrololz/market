import { describe, it, expect, beforeEach, vi } from 'vitest';
import appLogger from '@/utils/logger';
import {
  userTokenCache,
  anonymousTokenCache,
  USER_TOKEN_CACHE_KEY,
  ANONYMOUS_TOKEN_CACHE_KEY,
  getStoredAnonymousId,
  setStoredAnonymousId,
  clearStoredAnonymousId,
} from './localStorageTokenCache';
import type { TokenStore } from '@commercetools/ts-client';

// Мокаем модуль appLogger
vi.mock('@/utils/logger', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const testUserCache = userTokenCache;
const testAnonymousCache = anonymousTokenCache;

describe('localStorageTokenCache (for user tokens)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should return an empty token store if localStorage is empty', () => {
    const tokenStore = testUserCache.get();
    expect(tokenStore.token).toBe('');
    expect(tokenStore.expirationTime).toBe(0);
    expect(tokenStore.refreshToken).toBeUndefined();
  });

  it('should set and get a token store', () => {
    const tokenData: TokenStore = {
      token: 'access-123',
      expirationTime: Date.now() + 3600000,
      refreshToken: 'refresh-456',
    };
    testUserCache.set(tokenData);
    const retrievedToken = testUserCache.get();
    expect(retrievedToken).toEqual(tokenData);
  });

  it('should clear the token store', () => {
    const tokenData: TokenStore = {
      token: 'access-123',
      expirationTime: 123,
      refreshToken: 'refresh-456',
    };
    testUserCache.set(tokenData);
    testUserCache.clear();
    const retrievedToken = testUserCache.get();
    expect(retrievedToken.token).toBe('');
  });

  it('should handle JSON parsing errors gracefully on get and call appLogger.error', () => {
    localStorageMock.setItem(USER_TOKEN_CACHE_KEY, 'not-a-json');
    const tokenStore = testUserCache.get();
    expect(tokenStore.token).toBe('');
    expect(appLogger.error).toHaveBeenCalled();
  });
});

describe('localStorageTokenCache (for anonymous tokens)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should return an empty token store if localStorage is empty', () => {
    const tokenStore = testAnonymousCache.get();
    expect(tokenStore.token).toBe('');
    expect(tokenStore.expirationTime).toBe(0);
    expect(tokenStore.refreshToken).toBeUndefined();
  });

  it('should set and get a token store', () => {
    const tokenData: TokenStore = {
      token: 'access-123',
      expirationTime: Date.now() + 3600000,
      refreshToken: 'refresh-456',
    };
    testAnonymousCache.set(tokenData);
    const retrievedToken = testAnonymousCache.get();
    expect(retrievedToken).toEqual(tokenData);
  });

  it('should clear the token store', () => {
    const tokenData: TokenStore = {
      token: 'access-123',
      expirationTime: 123,
      refreshToken: 'refresh-456',
    };
    testAnonymousCache.set(tokenData);
    testAnonymousCache.clear();
    const retrievedToken = testAnonymousCache.get();
    expect(retrievedToken.token).toBe('');
  });

  it('should handle JSON parsing errors gracefully on get and call appLogger.error', () => {
    localStorageMock.setItem(ANONYMOUS_TOKEN_CACHE_KEY, 'not-a-json');
    const tokenStore = testAnonymousCache.get();
    expect(tokenStore.token).toBe('');
    expect(appLogger.error).toHaveBeenCalled();
  });
});

describe('anonymousId storage functions', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('getStoredAnonymousId should return null if no id is stored', () => {
    expect(getStoredAnonymousId()).toBeNull();
  });

  it('setStoredAnonymousId should store the id and getStoredAnonymousId should retrieve it', () => {
    const testId = 'anon-test-123';
    setStoredAnonymousId(testId);
    expect(getStoredAnonymousId()).toBe(testId);
  });

  it('clearStoredAnonymousId should remove the id from storage', () => {
    const testId = 'anon-test-123';
    setStoredAnonymousId(testId);
    clearStoredAnonymousId();
    expect(getStoredAnonymousId()).toBeNull();
  });
});
