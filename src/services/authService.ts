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
import { clientId, clientSecret, authUrl } from '@/api/ctpClient';
import { CtpClientFactory } from '@/api/ctpClientBuilderFactory';
import { type RegistrationData } from '@/stores/authStore';
import { v4 as uuidv4 } from 'uuid';
import { parseCtpError } from './authErrors';

class AuthService {
  private currentAnonymousId: string | null = getStoredAnonymousId();

  private async getOrCreateAnonymousApiRoot(): Promise<{
    apiRoot: ByProjectKeyRequestBuilder;
    anonymousId: string;
  } | null> {
    console.log('AuthService: Ensuring anonymous session...');
    let anonymousIdToUse = this.currentAnonymousId || getStoredAnonymousId();

    const currentAnonymousTokens = anonymousTokenCache.get();
    if (anonymousIdToUse && currentAnonymousTokens.refreshToken) {
      console.log(
        `AuthService: Attempting to refresh anonymous session for ID: ${anonymousIdToUse}`,
      );
      try {
        const anonymousApiRoot =
          CtpClientFactory.createAnonymousFlowApiRoot(anonymousIdToUse);
        console.log(
          `AuthService: Anonymous session refreshed for ID: ${anonymousIdToUse}`,
        );
        this.currentAnonymousId = anonymousIdToUse;
        return { apiRoot: anonymousApiRoot, anonymousId: anonymousIdToUse };
      } catch (refreshError) {
        console.warn(
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
      console.log(
        `AuthService: Generating new anonymous ID: ${anonymousIdToUse}`,
      );
    }
    this.currentAnonymousId = anonymousIdToUse;
    setStoredAnonymousId(this.currentAnonymousId);

    console.log(
      `AuthService: Creating new anonymous session with ID: ${this.currentAnonymousId}`,
    );
    try {
      const anonymousApiRoot = CtpClientFactory.createAnonymousFlowApiRoot(
        this.currentAnonymousId,
      );
      console.log(
        'AuthService: New anonymous session created and token cached.',
      );
      return {
        apiRoot: anonymousApiRoot,
        anonymousId: this.currentAnonymousId,
      };
    } catch (error) {
      console.error('AuthService: Failed to create anonymous session:', error);
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
    console.log('AuthService: Anonymous session data cleared.');
  }

  async login(email: string, password: string): Promise<Customer> {
    console.log('AuthService: Attempting login with /me/login strategy...');
    let customerDataFromMeLogin: Customer | undefined;

    const anonymousSession = await this.getOrCreateAnonymousApiRoot();
    if (!anonymousSession) {
      throw new Error(
        'Не удалось получить/создать анонимную сессию для логина.',
      );
    }

    try {
      const signInBody: MyCustomerSignin = {
        email,
        password,
        activeCartSignInMode: 'MergeWithExistingCustomerCart',
        updateProductData: true,
      };
      console.log(
        'AuthService: Calling /me/login with anonymous token and body:',
        signInBody,
      );
      const meLoginResponse = await anonymousSession.apiRoot
        .me()
        .login()
        .post({ body: signInBody })
        .execute();
      const signInResult = meLoginResponse.body as CustomerSignInResult;
      customerDataFromMeLogin = signInResult.customer;
      console.log(
        'AuthService: /me/login successful, customer data obtained. Cart (if any):',
        signInResult.cart,
      );

      this.clearAnonymousSessionData();

      console.log(
        'AuthService: Performing Password Flow to get user tokens...',
      );
      userTokenCache.clear();
      const userApiRoot = CtpClientFactory.createPasswordFlowApiRoot({
        email,
        password,
      });

      await userApiRoot.me().get().execute();
      console.log(
        'AuthService: User tokens obtained and cached via Password Flow.',
      );

      return customerDataFromMeLogin;
    } catch (error) {
      console.error('AuthService Login Error:', error);
      userTokenCache.clear();
      throw parseCtpError(error);
    }
  }

  async registerAndLogin(data: RegistrationData): Promise<Customer> {
    console.log('AuthService: Attempting registration...');
    const anonymousSession = await this.getOrCreateAnonymousApiRoot();
    if (!anonymousSession) {
      throw new Error(
        'Не удалось инициализировать анонимную сессию для регистрации.',
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

      await anonymousSession.apiRoot
        .me()
        .signup()
        .post({ body: myCustomerDraft })
        .execute();
      console.log(
        'AuthService: Registration part successful. Attempting auto-login...',
      );

      this.clearAnonymousSessionData();

      return await this.login(data.email, data.password);
    } catch (error) {
      console.error('AuthService Register Error:', error);
      throw parseCtpError(error);
    }
  }

  async logout(): Promise<void> {
    console.log('AuthService: Logging out...');
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
        console.log('AuthService: Token revocation attempted.');
      } catch (error) {
        console.error(
          'AuthService: Token revocation failed:',
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }

  async checkAuthAndRefresh(): Promise<Customer | null> {
    console.log('AuthService: Checking auth and refreshing token...');
    const initialTokenState = userTokenCache.get();

    if (!initialTokenState.refreshToken) {
      console.log('AuthService: No refresh token found.');
      return null;
    }

    try {
      const refreshApiRoot = CtpClientFactory.createRefreshTokenFlowApiRoot(
        initialTokenState.refreshToken,
        userTokenCache,
      );
      const meResponse = await refreshApiRoot.me().get().execute();
      console.log('AuthService: Session restored/refreshed successfully.');
      return meResponse.body as Customer;
    } catch (error: unknown) {
      console.error('AuthService: Failed to refresh session:', error);
      userTokenCache.clear();
      return null;
    }
  }
}

export default new AuthService();
