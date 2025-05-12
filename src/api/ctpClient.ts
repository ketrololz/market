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
  console.error(
    'ОШИБКА: Не найдены все необходимые переменные окружения CommerceTools в .env!',
  );
}

export const appApiRoot = CtpClientFactory.createAppApiRoot();

console.log(
  `ctpClient.ts: Initialized apiRoot for project ${projectKey} using Client Credentials Flow.`,
);
