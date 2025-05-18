import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { CtpClientFactory } from './ctpClientBuilderFactory';
import {
  userTokenCache,
  anonymousTokenCache,
} from '@/api/localStorageTokenCache';
import {
  authUrl,
  projectKey,
  clientId,
  clientSecret,
  scopes,
  apiUrl,
} from './ctpConfig';

const mockClientBuilderInstance = {
  withClientCredentialsFlow: vi.fn().mockReturnThis(),
  withPasswordFlow: vi.fn().mockReturnThis(),
  withAnonymousSessionFlow: vi.fn().mockReturnThis(),
  withRefreshTokenFlow: vi.fn().mockReturnThis(),
  withExistingTokenFlow: vi.fn().mockReturnThis(),
  withHttpMiddleware: vi.fn().mockReturnThis(),
  withLoggerMiddleware: vi.fn().mockReturnThis(),
  build: vi.fn().mockReturnValue({}),
};

vi.mock('@commercetools/ts-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@commercetools/ts-client')>();
  return {
    ...actual,
    ClientBuilder: vi.fn(() => mockClientBuilderInstance),
  };
});

const mockApiRootBuilder = {
  withProjectKey: vi.fn().mockReturnThis(),
};
vi.mock('@commercetools/platform-sdk', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@commercetools/platform-sdk')>();
  return {
    ...actual,
    createApiBuilderFromCtpClient: vi.fn(() => mockApiRootBuilder),
  };
});

describe('CtpClientFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createAppApiRoot should configure ClientBuilder correctly', () => {
    CtpClientFactory.createAppApiRoot();

    expect(ClientBuilder).toHaveBeenCalledTimes(1);
    expect(
      mockClientBuilderInstance.withClientCredentialsFlow,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        host: authUrl,
        projectKey,
        credentials: { clientId, clientSecret },
        scopes,
        httpClient: fetch,
      }),
    );
    expect(mockClientBuilderInstance.withHttpMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({ host: apiUrl, httpClient: fetch }),
    );
    expect(mockClientBuilderInstance.build).toHaveBeenCalledTimes(1);
    expect(createApiBuilderFromCtpClient).toHaveBeenCalledWith(
      mockClientBuilderInstance.build(),
    );
    expect(mockApiRootBuilder.withProjectKey).toHaveBeenCalledWith({
      projectKey,
    });
  });

  it('createPasswordFlowApiRoot should configure ClientBuilder correctly (with cache)', () => {
    const userCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };
    CtpClientFactory.createPasswordFlowApiRoot(userCredentials);

    expect(ClientBuilder).toHaveBeenCalledTimes(1);
    expect(mockClientBuilderInstance.withPasswordFlow).toHaveBeenCalledWith(
      expect.objectContaining({
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
      }),
    );
    expect(mockClientBuilderInstance.withHttpMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({ host: apiUrl, httpClient: fetch }),
    );
    expect(mockClientBuilderInstance.build).toHaveBeenCalledTimes(1);
    expect(createApiBuilderFromCtpClient).toHaveBeenCalledWith(
      mockClientBuilderInstance.build(),
    );
    expect(mockApiRootBuilder.withProjectKey).toHaveBeenCalledWith({
      projectKey,
    });
  });

  it('createPasswordFlowApiRoot should configure ClientBuilder correctly (without cache)', () => {
    const userCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };
    CtpClientFactory.createPasswordFlowApiRoot(userCredentials);
    expect(mockClientBuilderInstance.withPasswordFlow).toHaveBeenCalledWith(
      expect.objectContaining({ tokenCache: userTokenCache }),
    );
  });

  it('createAnonymousFlowApiRoot should configure ClientBuilder correctly', () => {
    const anonymousId = 'anon-123';
    CtpClientFactory.createAnonymousFlowApiRoot(anonymousId);

    expect(ClientBuilder).toHaveBeenCalledTimes(1);
    expect(
      mockClientBuilderInstance.withAnonymousSessionFlow,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        host: authUrl,
        projectKey,
        credentials: { clientId, clientSecret, anonymousId },
        scopes,
        httpClient: fetch,
        tokenCache: anonymousTokenCache,
      }),
    );
    expect(mockClientBuilderInstance.withHttpMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({ host: apiUrl, httpClient: fetch }),
    );
    expect(mockClientBuilderInstance.build).toHaveBeenCalledTimes(1);
  });

  it('createRefreshTokenFlowApiRoot should configure ClientBuilder correctly for user token', () => {
    const refreshToken = 'user-refresh-token';
    CtpClientFactory.createRefreshTokenFlowApiRoot(
      refreshToken,
      userTokenCache,
    );

    expect(mockClientBuilderInstance.withRefreshTokenFlow).toHaveBeenCalledWith(
      expect.objectContaining({
        host: authUrl,
        projectKey,
        credentials: { clientId, clientSecret },
        refreshToken,
        tokenCache: userTokenCache,
        httpClient: fetch,
      }),
    );
  });

  it('createRefreshTokenFlowApiRoot should configure ClientBuilder correctly for anonymous token', () => {
    const refreshToken = 'anon-refresh-token';
    CtpClientFactory.createRefreshTokenFlowApiRoot(
      refreshToken,
      anonymousTokenCache,
    );

    expect(mockClientBuilderInstance.withRefreshTokenFlow).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshToken,
        tokenCache: anonymousTokenCache,
      }),
    );
  });

  it('createExistingTokenFlowApiRoot should configure ClientBuilder correctly', () => {
    const accessToken = 'existing-access-token';
    CtpClientFactory.createExistingTokenFlowApiRoot(accessToken);

    expect(
      mockClientBuilderInstance.withExistingTokenFlow,
    ).toHaveBeenCalledWith(`Bearer ${accessToken}`, { force: true });
  });
});
