import appLogger from '@/utils/logger';
import {
  type Customer,
  type MyCustomerDraft,
  type CustomerSignInResult,
  type MyCustomerSignin,
  type BaseAddress,
} from '@commercetools/platform-sdk';
import { userTokenCache } from '@/api/localStorageTokenCache';
import { CtpClientFactory } from '@/api/ctpClientBuilderFactory';
import { type LoginData, type RegistrationData } from '@/stores/authStore';
import { AuthError, parseCtpError } from './authErrors';
import { loginSchema } from '@/schemas/loginSchema';
import { registrationSchema } from '@/schemas/registrationSchema';
import { AuthMessageKey } from '@/localization/i18nKeys';
import { authUrl, clientId, clientSecret } from '@/api/ctpConfig';
import AnonymousSessionService from './anonymousSessionService';
import { validateData } from '@/utils/validationUtils';

class AuthService {
  public async login(data: LoginData): Promise<Customer> {
    appLogger.log('AuthService: Attempting login with /me/login strategy...');

    await validateData(loginSchema, data, 'Login Data');

    const anonymousSession = await AnonymousSessionService.ensureSession();
    if (!anonymousSession) {
      throw new AuthError(AuthMessageKey.UnknownError, {
        details: 'Failed to ensure anonymous session for login.',
      });
    }

    userTokenCache.clear();

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
        'AuthService: Login successful, customer data obtained. Cart (if any):',
        signInResult.cart,
      );

      AnonymousSessionService.clearData();

      appLogger.log(
        'AuthService: Performing Password Flow to get user tokens...',
      );
      userTokenCache.clear();
      const userApiRoot = CtpClientFactory.createPasswordFlowApiRoot({
        email: data.email,
        password: data.password,
      });

      await userApiRoot.me().get().execute();
      return signInResult.customer;
    } catch (error) {
      appLogger.error('AuthService Login Error:', error);
      userTokenCache.clear();
      throw parseCtpError(error);
    }
  }

  public async register(data: RegistrationData): Promise<CustomerSignInResult> {
    appLogger.log('AuthService: Attempting registration...');

    await validateData(
      registrationSchema,
      {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      },
      'Registration Data',
    );

    const anonymousSession = await AnonymousSessionService.ensureSession();
    if (!anonymousSession) {
      throw new AuthError(AuthMessageKey.UnknownError, {
        details: 'Failed to ensure anonymous session for registration.',
      });
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
      AnonymousSessionService.clearData();

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
    AnonymousSessionService.clearData();

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

export { AuthService };
export default new AuthService();
