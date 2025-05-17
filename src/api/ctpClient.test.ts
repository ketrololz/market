import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockAppApiRootInstance = {
  withProjectKey: vi.fn().mockReturnThis(),
} as unknown as ByProjectKeyRequestBuilder;
const mockCreateAppApiRoot = vi.fn(() => mockAppApiRootInstance);

vi.mock('./ctpClientBuilderFactory', () => ({
  CtpClientFactory: {
    createAppApiRoot: mockCreateAppApiRoot,
  },
}));

const mockAppLoggerLog = vi.fn();
vi.mock('@/utils/logger', () => ({
  default: {
    log: mockAppLoggerLog,
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const MOCK_PROJECT_KEY = 'test-project-key-from-mock';
vi.mock('./ctpConfig', () => ({
  projectKey: MOCK_PROJECT_KEY,
  clientId: 'mockClientId',
  clientSecret: 'mockClientSecret',
  apiUrl: 'mockApiUrl',
  authUrl: 'mockAuthUrl',
  scopes: ['mockScope'],
}));

describe('ctpClient.ts', () => {
  let appApiRootModule: typeof import('./ctpClient');

  beforeEach(async () => {
    vi.clearAllMocks();
    appApiRootModule = await import('./ctpClient');
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should call CtpClientFactory.createAppApiRoot on initialization', () => {
    expect(mockCreateAppApiRoot).toHaveBeenCalledTimes(1);
  });

  it('should log a message on initialization with the correct projectKey', () => {
    expect(mockAppLoggerLog).toHaveBeenCalledTimes(1);
    expect(mockAppLoggerLog).toHaveBeenCalledWith(
      `ctpClient.ts: Initialized apiRoot for project ${MOCK_PROJECT_KEY} using Client Credentials Flow.`,
    );
  });

  it('should export appApiRoot, and it should be the result from the factory', () => {
    expect(appApiRootModule.appApiRoot).toBeDefined();
    expect(appApiRootModule.appApiRoot).toBe(mockAppApiRootInstance);
  });
});
