import appLogger from '@/utils/logger';
import { CtpClientFactory } from './ctpClientBuilderFactory';
import { projectKey } from './ctpConfig';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';

let memoizedAppApiRoot: ByProjectKeyRequestBuilder | null = null;

export function getAppApiRoot(): ByProjectKeyRequestBuilder {
  if (!memoizedAppApiRoot) {
    memoizedAppApiRoot = CtpClientFactory.createAppApiRoot();
    appLogger.log(
      `ctpClient.ts: Initialized appApiRoot for project ${projectKey} using Client Credentials Flow.`,
    );
  }
  return memoizedAppApiRoot;
}
