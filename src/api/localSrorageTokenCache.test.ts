import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userTokenCache, USER_TOKEN_CACHE_KEY } from './localStorageTokenCache';
import type { TokenStore } from '@commercetools/ts-client';

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

const userCache = userTokenCache;

describe('localStorageTokenCache (for user tokens)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return an empty token store if localStorage is empty', () => {
    const tokenStore = userCache.get();
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
    userCache.set(tokenData);
    const retrievedToken = userCache.get();
    expect(retrievedToken).toEqual(tokenData);
  });

  it('should clear the token store', () => {
    const tokenData: TokenStore = {
      token: 'access-123',
      expirationTime: 123,
      refreshToken: 'refresh-456',
    };
    userCache.set(tokenData);
    userCache.clear();
    const retrievedToken = userCache.get();
    expect(retrievedToken.token).toBe('');
  });

  it('should handle JSON parsing errors gracefully on get', () => {
    localStorageMock.setItem(USER_TOKEN_CACHE_KEY, 'not-a-json');
    const tokenStore = userCache.get();
    expect(tokenStore.token).toBe('');
    expect(console.error).toHaveBeenCalled();
  });
});
