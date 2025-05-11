import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from '@commercetools/ts-client';

export const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;
export const clientId = import.meta.env.VITE_CTP_CLIENT_ID;
export const clientSecret = import.meta.env.VITE_CTP_CLIENT_SECRET;
export const apiUrl = import.meta.env.VITE_CTP_API_URL;
export const authUrl = import.meta.env.VITE_CTP_AUTH_URL;
export const scopes = import.meta.env.VITE_CTP_SCOPES?.split(' ') || [];

const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: authUrl,
  projectKey,
  credentials: {
    clientId,
    clientSecret,
  },
  scopes,
  httpClient: fetch,
};

const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: apiUrl,
  httpClient: fetch,
};

export const ctpClient = new ClientBuilder()
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  .withLoggerMiddleware()
  .build();

const apiRootBuilder = createApiBuilderFromCtpClient(ctpClient);

export const apiRoot = apiRootBuilder.withProjectKey({
  projectKey,
});

console.log(
  `ctpClient.ts: Initialized apiRoot for project ${projectKey} using Client Credentials Flow.`,
);
