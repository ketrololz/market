import {
  ClientBuilder,
  type AuthMiddlewareOptions,
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
  projectKey,
  clientId,
  clientSecret,
  apiUrl,
  authUrl,
  scopes,
} from '@/api/ctpClient';

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
      .withLoggerMiddleware()
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  static createPasswordFlowApiRoot(
    userCredentials: { email: string; password: string },
    useCache: boolean = true,
  ): ByProjectKeyRequestBuilder {
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
    };
    if (useCache) {
      passwordAuthOptions.tokenCache = userTokenCache;
    }
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
      tokenCache: anonymousTokenCache,
      httpClient: fetch,
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
    useCacheOptionForUser: boolean = true,
  ): ByProjectKeyRequestBuilder {
    const refreshAuthOptions: RefreshAuthMiddlewareOptions = {
      host: authUrl,
      projectKey,
      credentials: { clientId, clientSecret },
      refreshToken,
      httpClient: fetch,
    };
    if (cacheToUse === userTokenCache && useCacheOptionForUser) {
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
}
