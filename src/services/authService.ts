import appLogger from '@/utils/logger';
import {
  type Customer,
  type MyCustomerDraft,
  type CustomerSignInResult,
  ByProjectKeyRequestBuilder,
  type MyCustomerSignin,
  type BaseAddress,
} from '@commercetools/platform-sdk';
import {
  userTokenCache,
  anonymousTokenCache,
  getStoredAnonymousId,
  setStoredAnonymousId,
  clearStoredAnonymousId,
} from '@/api/localStorageTokenCache';
import {
  clientId,
  clientSecret,
  authUrl,
  projectKey,
  scopes,
} from '@/api/ctpClient';
import { CtpClientFactory } from '@/api/ctpClientBuilderFactory';
import { type LoginData, type RegistrationData } from '@/stores/authStore';
import { v4 as uuidv4 } from 'uuid';
import { parseCtpError } from './authErrors';

class AuthService {
  private currentAnonymousId: string | null = getStoredAnonymousId();
  private currentUserAccessToken: string | null = null;
  private currentUserRefreshToken: string | null = null;

  private async getOrCreateAnonymousApiRoot(): Promise<{
    apiRoot: ByProjectKeyRequestBuilder;
    anonymousId: string;
  } | null> {
    appLogger.log('AuthService: Ensuring anonymous session...');
    let anonymousIdToUse = this.currentAnonymousId || getStoredAnonymousId();

    const currentAnonymousTokens = anonymousTokenCache.get();
    if (anonymousIdToUse && currentAnonymousTokens.refreshToken) {
      appLogger.log(
        `AuthService: Attempting to refresh anonymous session for ID: ${anonymousIdToUse}`,
      );
      try {
        const anonymousApiRoot =
          CtpClientFactory.createAnonymousFlowApiRoot(anonymousIdToUse);
        appLogger.log(
          `AuthService: Anonymous session refreshed for ID: ${anonymousIdToUse}`,
        );
        this.currentAnonymousId = anonymousIdToUse;
        return { apiRoot: anonymousApiRoot, anonymousId: anonymousIdToUse };
      } catch (refreshError) {
        appLogger.warn(
          'AuthService: Failed to refresh anonymous token, will create a new one.',
          refreshError,
        );
        anonymousTokenCache.clear();
        clearStoredAnonymousId();
        anonymousIdToUse = null;
      }
    }

    if (!anonymousIdToUse) {
      anonymousIdToUse = uuidv4();
      appLogger.log(
        `AuthService: Generating new anonymous ID: ${anonymousIdToUse}`,
      );
    }
    this.currentAnonymousId = anonymousIdToUse;
    setStoredAnonymousId(this.currentAnonymousId);

    appLogger.log(
      `AuthService: Creating new anonymous session with ID: ${this.currentAnonymousId}`,
    );
    try {
      const anonymousApiRoot = CtpClientFactory.createAnonymousFlowApiRoot(
        this.currentAnonymousId,
      );
      appLogger.log(
        'AuthService: New anonymous session created and token cached.',
      );
      return {
        apiRoot: anonymousApiRoot,
        anonymousId: this.currentAnonymousId,
      };
    } catch (error) {
      appLogger.error(
        'AuthService: Failed to create anonymous session:',
        error,
      );
      clearStoredAnonymousId();
      this.currentAnonymousId = null;
      anonymousTokenCache.clear();
      throw parseCtpError(error);
    }
  }

  private clearAnonymousSessionData(): void {
    anonymousTokenCache.clear();
    clearStoredAnonymousId();
    this.currentAnonymousId = null;
    appLogger.log('AuthService: Anonymous session data cleared.');
  }

  public async login(data: LoginData): Promise<Customer> {
    appLogger.log('AuthService: Attempting login with /me/login strategy...');

    const anonymousSession = await this.getOrCreateAnonymousApiRoot();
    if (!anonymousSession) {
      throw new Error('Failed to get/create anonymous session for login.');
    }

    userTokenCache.clear();
    this.currentUserAccessToken = null;
    this.currentUserRefreshToken = null;

    try {
      const signInBody: MyCustomerSignin = {
        email: data.email,
        password: data.password,
        activeCartSignInMode: 'MergeWithExistingCustomerCart',
        updateProductData: true,
      };
      appLogger.log(
        'AuthService: Calling /me/login with anonymous token and body:',
        signInBody,
      );
      const meLoginResponse = await anonymousSession.apiRoot
        .me()
        .login()
        .post({ body: signInBody })
        .execute();
      const signInResult = meLoginResponse.body as CustomerSignInResult;
      appLogger.log(
        'AuthService: /me/login successful, customer data obtained. Cart (if any):',
        signInResult.cart,
      );

      this.clearAnonymousSessionData();

      appLogger.log(
        'AuthService: Performing Password Flow to get user tokens...',
      );
      userTokenCache.clear();
      const userApiRoot = CtpClientFactory.createPasswordFlowApiRoot(
        {
          email: data.email,
          password: data.password,
        },
        false,
      );

      await userApiRoot.me().get().execute();

      appLogger.log(
        'AuthService: Explicitly fetching user tokens (not saving to localStorage)...',
      );
      const tokenResponse = await fetch(
        `${authUrl}/oauth/${projectKey}/customers/token`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            username: data.email,
            password: data.password,
            scope: scopes.join(' '),
          }),
        },
      );

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.json();
        throw new Error(
          `Error getting tokens: ${errorBody.error_description || tokenResponse.statusText}`,
        );
      }
      const tokenData = await tokenResponse.json();
      this.currentUserAccessToken = tokenData.access_token;
      this.currentUserRefreshToken = tokenData.refresh_token;
      appLogger.log(
        `AuthService: User tokens obtained and stored in memory: access_token=${this.currentUserAccessToken}, refresh_token=${this.currentUserRefreshToken}`,
      );

      if (anonymousSession?.anonymousId) {
        this.clearAnonymousSessionData();
      }

      return signInResult.customer;
    } catch (error) {
      appLogger.error('AuthService Login Error:', error);
      userTokenCache.clear();
      throw parseCtpError(error);
    }
  }

  public async register(data: RegistrationData): Promise<CustomerSignInResult> {
    appLogger.log('AuthService: Attempting registration...');
    const anonymousSession = await this.getOrCreateAnonymousApiRoot();
    if (!anonymousSession) {
      throw new Error(
        'Failed to initialize anonymous session for registration.',
      );
    }

    try {
      const addresses: BaseAddress[] = [];

      const shippingAddr: BaseAddress = { ...data.shippingAddress };
      addresses.push(shippingAddr);

      let billingAddr: BaseAddress = shippingAddr;
      if (!data.useShippingAsBilling && data.billingAddress) {
        billingAddr = { ...data.billingAddress };
        addresses.push(billingAddr);
      }

      let defaultShippingAddressIndex: number | undefined = undefined;
      let defaultBillingAddressIndex: number | undefined = undefined;

      if (data.shippingAddress.isDefaultShipping) {
        defaultShippingAddressIndex = addresses.indexOf(shippingAddr);
      }

      if (data.useShippingAsBilling && data.shippingAddress.isDefaultBilling) {
        defaultBillingAddressIndex = addresses.indexOf(shippingAddr);
      } else if (
        !data.useShippingAsBilling &&
        data.billingAddress?.isDefaultBilling
      ) {
        defaultBillingAddressIndex = addresses.indexOf(billingAddr);
      }

      const myCustomerDraft: MyCustomerDraft = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        addresses: addresses,
        ...(defaultShippingAddressIndex !== undefined && {
          defaultShippingAddress: defaultShippingAddressIndex,
        }),
        ...(defaultBillingAddressIndex !== undefined && {
          defaultBillingAddress: defaultBillingAddressIndex,
        }),
      };

      const response = await anonymousSession.apiRoot
        .me()
        .signup()
        .post({ body: myCustomerDraft })
        .execute();
      appLogger.log(
        'AuthService: Registration part successful. Attempting auto-login...',
      );

      this.clearAnonymousSessionData();

      return response.body;
    } catch (error) {
      appLogger.error('AuthService Register Error:', error);
      throw parseCtpError(error);
    }
  }

  public async logout(): Promise<void> {
    appLogger.log('AuthService: Logging out...');
    const tokenCache = userTokenCache;
    const currentTokens = tokenCache.get();
    const tokenToRevoke = currentTokens.refreshToken || currentTokens.token;

    tokenCache.clear();
    this.clearAnonymousSessionData();

    if (tokenToRevoke) {
      try {
        const revokeUrl = `${authUrl}/oauth/token/revoke`;
        const credentials = btoa(`${clientId}:${clientSecret}`);
        await fetch(revokeUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `token=${encodeURIComponent(tokenToRevoke)}`,
        });
        appLogger.log('AuthService: Token revocation attempted.');
      } catch (error) {
        appLogger.error(
          'AuthService: Token revocation failed:',
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }

  public async restoreSession(): Promise<Customer | null> {
    appLogger.log('AuthService: Checking auth and refreshing token...');
    const initialTokenState = userTokenCache.get();

    if (!initialTokenState.refreshToken) {
      appLogger.log('AuthService: No refresh token found.');
      return null;
    }

    try {
      const refreshApiRoot = CtpClientFactory.createRefreshTokenFlowApiRoot(
        initialTokenState.refreshToken,
        userTokenCache,
      );
      const meResponse = await refreshApiRoot.me().get().execute();
      appLogger.log('AuthService: Session restored/refreshed successfully.');
      return meResponse.body as Customer;
    } catch (error: unknown) {
      appLogger.error('AuthService: Failed to refresh session:', error);
      userTokenCache.clear();
      return null;
    }
  }
}

export default new AuthService();
