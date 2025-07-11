import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type ExistingTokenMiddlewareOptions,
  type PasswordAuthMiddlewareOptions,
  type RefreshAuthMiddlewareOptions,
} from '@commercetools/ts-client';
import {
  createApiBuilderFromCtpClient,
  type ByProjectKeyRequestBuilder,
} from '@commercetools/platform-sdk';
import {
  userTokenCache,
  anonymousTokenCache,
  type ClearableTokenCache,
} from '@/api/localStorageTokenCache';
import {
  authUrl,
  projectKey,
  clientId,
  clientSecret,
  scopes,
  apiUrl,
} from './ctpConfig';

export class CtpClientFactory {
  static createAppApiRoot(): ByProjectKeyRequestBuilder {
    const appAuthOptions: AuthMiddlewareOptions = {
      host: authUrl,
      projectKey,
      credentials: { clientId, clientSecret },
      scopes,
      httpClient: fetch,
    };
    const client = new ClientBuilder()
      .withClientCredentialsFlow(appAuthOptions)
      .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  static createPasswordFlowApiRoot(userCredentials: {
    email: string;
    password: string;
  }): ByProjectKeyRequestBuilder {
    const passwordAuthOptions: PasswordAuthMiddlewareOptions = {
      host: authUrl,
      projectKey,
      credentials: {
        clientId,
        clientSecret,
        user: {
          username: userCredentials.email,
          password: userCredentials.password,
        },
      },
      scopes,
      httpClient: fetch,
      tokenCache: userTokenCache,
    };
    const client = new ClientBuilder()
      .withPasswordFlow(passwordAuthOptions)
      .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  static createAnonymousFlowApiRoot(
    anonymousId: string,
  ): ByProjectKeyRequestBuilder {
    const anonymousAuthOptions: AuthMiddlewareOptions = {
      host: authUrl,
      projectKey,
      credentials: { clientId, clientSecret, anonymousId },
      scopes,
      httpClient: fetch,
      tokenCache: anonymousTokenCache,
    };
    const client = new ClientBuilder()
      .withAnonymousSessionFlow(anonymousAuthOptions)
      .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  static createRefreshTokenFlowApiRoot(
    refreshToken: string,
    cacheToUse: ClearableTokenCache,
  ): ByProjectKeyRequestBuilder {
    const refreshAuthOptions: RefreshAuthMiddlewareOptions = {
      host: authUrl,
      projectKey,
      credentials: { clientId, clientSecret },
      refreshToken,
      httpClient: fetch,
    };
    if (cacheToUse === userTokenCache) {
      refreshAuthOptions.tokenCache = userTokenCache;
    } else if (cacheToUse === anonymousTokenCache) {
      refreshAuthOptions.tokenCache = anonymousTokenCache;
    }

    const client = new ClientBuilder()
      .withRefreshTokenFlow(refreshAuthOptions)
      .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  static createExistingTokenFlowApiRoot(
    accessToken: string,
  ): ByProjectKeyRequestBuilder {
    const existingTokenOptions: ExistingTokenMiddlewareOptions = {
      force: true,
    };
    const client = new ClientBuilder()
      .withExistingTokenFlow(`Bearer ${accessToken}`, existingTokenOptions)
      .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  static createApiRootWithUserSession(): ByProjectKeyRequestBuilder {
    const tokens = userTokenCache.get();
    if (!tokens.token) {
      throw new Error('No user token available for authenticated request.');
    }

    const client = new ClientBuilder()
      .withExistingTokenFlow(`Bearer ${tokens.token}`, { force: true })
      .withHttpMiddleware({ host: apiUrl, httpClient: fetch })
      .build();

    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }
}
