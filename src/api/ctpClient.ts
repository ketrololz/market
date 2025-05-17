import appLogger from '@/utils/logger';
import { CtpClientFactory } from './ctpClientBuilderFactory';
import { projectKey } from './ctpConfig';

export const appApiRoot = CtpClientFactory.createAppApiRoot();

appLogger.log(
  `ctpClient.ts: Initialized apiRoot for project ${projectKey} using Client Credentials Flow.`,
);
