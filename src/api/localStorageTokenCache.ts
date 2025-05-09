import type { TokenCache, TokenStore } from '@commercetools/ts-client';

const TOKEN_CACHE_KEY = 'ctp_token_cache';

export const localStorageTokenCache: ClearableTokenCache = {
  get(): TokenStore {
    const storedData = localStorage.getItem(TOKEN_CACHE_KEY);
    if (storedData) {
      try {
        const tokenData = JSON.parse(storedData);
        return {
          token: tokenData.token || '',
          expirationTime: Number(tokenData.expirationTime) || 0,
          refreshToken: tokenData.refreshToken || undefined,
        };
      } catch (error) {
        console.error('Error parsing token cache from localStorage:', error);
        localStorage.removeItem(TOKEN_CACHE_KEY);
        return { token: '', expirationTime: 0 };
      }
    }
    return { token: '', expirationTime: 0 };
  },

  set(cache: TokenStore): void {
    try {
      localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error setting token cache in localStorage:', error);
    }
  },

  clear(): void {
    localStorage.removeItem(TOKEN_CACHE_KEY);
    console.log('Token cache cleared from localStorage.');
  },
};

export interface ClearableTokenCache extends TokenCache {
  clear: () => void;
}
