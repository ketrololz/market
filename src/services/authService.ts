import {
  ClientBuilder,
  type PasswordAuthMiddlewareOptions,
  type RefreshAuthMiddlewareOptions,
} from '@commercetools/ts-client';
import {
  createApiBuilderFromCtpClient,
  type Customer,
  type MyCustomerDraft,
} from '@commercetools/platform-sdk';
import {
  localStorageTokenCache,
  type ClearableTokenCache,
} from '@/api/localStorageTokenCache';
import {
  projectKey,
  clientId,
  clientSecret,
  apiUrl,
  authUrl,
  scopes,
  apiRoot,
} from '@/api/ctpClient';
import { type RegistrationData } from '@/stores/authStore';

class AuthService {
  async login(email: string, password: string): Promise<Customer> {
    console.log('AuthService: Attempting login...');
    (localStorageTokenCache as ClearableTokenCache).clear();
    try {
      const passwordAuthOptions: PasswordAuthMiddlewareOptions = {
        host: authUrl,
        projectKey,
        credentials: {
          clientId,
          clientSecret,
          user: { username: email, password },
        },
        scopes,
        tokenCache: localStorageTokenCache,
        httpClient: fetch,
      };
      const loginClient = new ClientBuilder()
        .withPasswordFlow(passwordAuthOptions)
        .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
        .build();
      const loginApiRoot = createApiBuilderFromCtpClient(
        loginClient,
      ).withProjectKey({ projectKey });
      const meResponse = await loginApiRoot.me().get().execute();
      console.log('AuthService: Login successful, user data fetched.');
      return meResponse.body as Customer;
    } catch (error: unknown) {
      console.error('AuthService Register Error:', error);
      const errorMessage = 'Произошла ошибка при регистрации.';
      throw new Error(errorMessage);
    }
  }

  async registerAndLogin(data: RegistrationData): Promise<Customer> {
    console.log('AuthService: Attempting registration...');
    try {
      const myCustomerDraft: MyCustomerDraft = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        // TODO: Добавить обработку адресов из data
      };
      await apiRoot.me().signup().post({ body: myCustomerDraft }).execute();
      console.log(
        'AuthService: Registration part successful. Attempting auto-login...',
      );
      return await this.login(data.email, data.password);
    } catch (error: unknown) {
      console.error('AuthService Register Error:', error);
      const errorMessage = 'Произошла ошибка при регистрации.';
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    console.log('AuthService: Logging out...');
    const tokenCache = localStorageTokenCache as ClearableTokenCache;
    const currentTokens = tokenCache.get();
    const tokenToRevoke = currentTokens.refreshToken || currentTokens.token;

    tokenCache.clear();

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
      } catch (err) {
        console.error('AuthService: Token revocation failed:', err);
      }
    }
  }

  async checkAuthAndRefresh(): Promise<Customer | null> {
    console.log('AuthService: Checking auth and refreshing token...');
    const initialTokenState = localStorageTokenCache.get();

    if (!initialTokenState.refreshToken) {
      console.log('AuthService: No refresh token found.');
      return null;
    }

    try {
      const refreshAuthOptions: RefreshAuthMiddlewareOptions = {
        host: authUrl,
        projectKey,
        credentials: { clientId, clientSecret },
        refreshToken: initialTokenState.refreshToken,
        tokenCache: localStorageTokenCache,
        httpClient: fetch,
      };
      const refreshClient = new ClientBuilder()
        .withRefreshTokenFlow(refreshAuthOptions)
        .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
        .build();
      const refreshApiRoot = createApiBuilderFromCtpClient(
        refreshClient,
      ).withProjectKey({ projectKey });

      const meResponse = await refreshApiRoot.me().get().execute();
      console.log('AuthService: Session restored/refreshed successfully.');
      return meResponse.body as Customer;
    } catch (error: unknown) {
      console.error('AuthService: Failed to refresh session:', error);
      localStorageTokenCache.clear();
      return null;
    }
  }
}

export default new AuthService();
