import appLogger from '@/utils/logger';
import { type ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import {
  anonymousTokenCache,
  getStoredAnonymousId,
  setStoredAnonymousId,
  clearStoredAnonymousId,
} from '@/api/localStorageTokenCache';
import { CtpClientFactory } from '@/api/ctpClientBuilderFactory';
import { v4 as uuidv4 } from 'uuid';
import { parseCtpError } from './authErrors';

export interface AnonymousSession {
  apiRoot: ByProjectKeyRequestBuilder;
  anonymousId: string;
}

class AnonymousSessionService {
  private currentAnonymousId: string | null = getStoredAnonymousId();

  /**
   * Ensures an active anonymous session exists, creating or refreshing one if necessary.
   * Returns an object with the apiRoot for the anonymous session and the anonymousId,
   * or null if an unrecoverable error occurs.
   */
  public async ensureSession(): Promise<AnonymousSession | null> {
    appLogger.log('AnonymousSessionService: Ensuring anonymous session...');
    let anonymousIdToUse = this.currentAnonymousId || getStoredAnonymousId();
    const currentTokens = anonymousTokenCache.get();

    if (anonymousIdToUse && currentTokens.refreshToken) {
      appLogger.log(
        `AnonymousSessionService: Attempting to refresh for ID: ${anonymousIdToUse}`,
      );
      try {
        const apiRoot = CtpClientFactory.createRefreshTokenFlowApiRoot(
          currentTokens.refreshToken,
          anonymousTokenCache,
        );
        appLogger.log(
          `AnonymousSessionService: Session refreshed for ID: ${anonymousIdToUse}`,
        );
        this.currentAnonymousId = anonymousIdToUse;
        return { apiRoot, anonymousId: anonymousIdToUse };
      } catch (refreshError) {
        appLogger.warn(
          'AnonymousSessionService: Failed to refresh token, creating new session.',
          refreshError,
        );
        this.clearData();
        anonymousIdToUse = null;
      }
    } else if (
      anonymousIdToUse ||
      currentTokens.token ||
      currentTokens.refreshToken
    ) {
      appLogger.log(
        'AnonymousSessionService: Incomplete anonymous session data found, clearing.',
      );
      this.clearData();
      anonymousIdToUse = null;
    }

    if (!anonymousIdToUse) {
      anonymousIdToUse = uuidv4();
      appLogger.log(
        `AnonymousSessionService: Generating new anonymous ID: ${anonymousIdToUse}`,
      );
    }

    this.currentAnonymousId = anonymousIdToUse;
    setStoredAnonymousId(this.currentAnonymousId);

    appLogger.log(
      `AnonymousSessionService: Creating new session with ID: ${this.currentAnonymousId}`,
    );
    try {
      const apiRoot = CtpClientFactory.createAnonymousFlowApiRoot(
        this.currentAnonymousId,
      );
      appLogger.log(
        'AnonymousSessionService: New session created and token cached.',
      );
      return { apiRoot, anonymousId: this.currentAnonymousId };
    } catch (error) {
      appLogger.error(
        'AnonymousSessionService: Failed to create session:',
        error,
      );
      this.clearData();
      throw parseCtpError(error);
    }
  }

  /**
   * Clears all stored anonymous session data (tokens and ID).
   */
  public clearData(): void {
    anonymousTokenCache.clear();
    clearStoredAnonymousId();
    this.currentAnonymousId = null;
    appLogger.log('AnonymousSessionService: Anonymous session data cleared.');
  }

  /**
   * Gets the current anonymous ID, if one exists.
   */
  public getCurrentAnonymousId(): string | null {
    return this.currentAnonymousId || getStoredAnonymousId();
  }
}

export default new AnonymousSessionService();
