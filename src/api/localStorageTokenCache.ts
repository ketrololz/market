import type { TokenCache, TokenStore } from '@commercetools/ts-client';

export const USER_TOKEN_CACHE_KEY = 'ctp_user_token_cache';
export const ANONYMOUS_TOKEN_CACHE_KEY = 'ctp_anonymous_token_cache';
const ANONYMOUS_ID_KEY = 'ctp_anonymous_id';

function createCacheInstance(storageKey: string): ClearableTokenCache {
  return {
    get(): TokenStore {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const tokenData = JSON.parse(storedData);
          return {
            token: tokenData.token || '',
            expirationTime: Number(tokenData.expirationTime) || 0,
            refreshToken: tokenData.refreshToken || undefined,
          };
        } catch (error) {
          console.error(
            `Error parsing token cache from localStorage (key: ${storageKey}):`,
            error,
          );
          localStorage.removeItem(storageKey);
          return { token: '', expirationTime: 0 };
        }
      }
      return { token: '', expirationTime: 0 };
    },

    set(cache: TokenStore): void {
      try {
        localStorage.setItem(storageKey, JSON.stringify(cache));
      } catch (error) {
        console.error(
          `Error setting token cache in localStorage (key: ${storageKey}):`,
          error,
        );
      }
    },

    clear(): void {
      localStorage.removeItem(storageKey);
      console.log(
        `Token cache cleared from localStorage (key: ${storageKey}).`,
      );
    },
  };
}

export const userTokenCache: ClearableTokenCache =
  createCacheInstance(USER_TOKEN_CACHE_KEY);
export const anonymousTokenCache: ClearableTokenCache = createCacheInstance(
  ANONYMOUS_TOKEN_CACHE_KEY,
);

export function getStoredAnonymousId(): string | null {
  return localStorage.getItem(ANONYMOUS_ID_KEY);
}

export function setStoredAnonymousId(id: string): void {
  localStorage.setItem(ANONYMOUS_ID_KEY, id);
}

export function clearStoredAnonymousId(): void {
  localStorage.removeItem(ANONYMOUS_ID_KEY);
  console.log('Anonymous ID cleared from localStorage.');
}

export interface ClearableTokenCache extends TokenCache {
  clear: () => void;
}
