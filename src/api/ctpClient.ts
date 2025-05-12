import appLogger from '@/utils/logger';
import { CtpClientFactory } from './ctpClientBuilderFactory';

export const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;
export const clientId = import.meta.env.VITE_CTP_CLIENT_ID;
export const clientSecret = import.meta.env.VITE_CTP_CLIENT_SECRET;
export const apiUrl = import.meta.env.VITE_CTP_API_URL;
export const authUrl = import.meta.env.VITE_CTP_AUTH_URL;
export const scopes = import.meta.env.VITE_CTP_SCOPES?.split(' ') || [];

if (
  !projectKey ||
  !clientId ||
  !clientSecret ||
  !apiUrl ||
  !authUrl ||
  !scopes.length
) {
  appLogger.error(
    'Not all required CommerceTools environment variables found in .env!',
  );
}

export const appApiRoot = CtpClientFactory.createAppApiRoot();

appLogger.log(
  `ctpClient.ts: Initialized apiRoot for project ${projectKey} using Client Credentials Flow.`,
);
