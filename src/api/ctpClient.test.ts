import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';

const mockCreatedApiRootInstance = {
  _isMockCreatedInstance: true,
  withProjectKey: vi.fn().mockReturnThis(),
} as unknown as ByProjectKeyRequestBuilder;

const mockCreateAppApiRoot = vi.fn(() => mockCreatedApiRootInstance);

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

describe('ctpClient.ts - getAppApiRoot', () => {
  let getAppApiRootFunction: () => ByProjectKeyRequestBuilder;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const ctpClientModule = await import('./ctpClient');
    getAppApiRootFunction = ctpClientModule.getAppApiRoot;
  });

  it('should call CtpClientFactory.createAppApiRoot and log on first call', () => {
    const apiRoot = getAppApiRootFunction();

    expect(mockCreateAppApiRoot).toHaveBeenCalledTimes(1);
    expect(mockAppLoggerLog).toHaveBeenCalledTimes(1);
    expect(mockAppLoggerLog).toHaveBeenCalledWith(
      `ctpClient.ts: Initialized appApiRoot for project ${MOCK_PROJECT_KEY} using Client Credentials Flow.`,
    );
    expect(apiRoot).toBe(mockCreatedApiRootInstance);
  });

  it('should return cached instance and NOT call factory or log on subsequent calls', () => {
    const firstApiRoot = getAppApiRootFunction();
    expect(mockCreateAppApiRoot).toHaveBeenCalledTimes(1);
    expect(mockAppLoggerLog).toHaveBeenCalledTimes(1);

    mockCreateAppApiRoot.mockClear();
    mockAppLoggerLog.mockClear();

    const secondApiRoot = getAppApiRootFunction();

    expect(mockCreateAppApiRoot).not.toHaveBeenCalled();
    expect(mockAppLoggerLog).not.toHaveBeenCalled();
    expect(secondApiRoot).toBe(firstApiRoot);
  });

  it('should re-initialize if modules are reset (simulating fresh import)', async () => {
    getAppApiRootFunction();
    expect(mockCreateAppApiRoot).toHaveBeenCalledTimes(1);
    expect(mockAppLoggerLog).toHaveBeenCalledTimes(1);

    vi.resetModules();
    vi.clearAllMocks();

    const ctpClientModuleFresh = await import('./ctpClient');
    const freshGetAppApiRoot = ctpClientModuleFresh.getAppApiRoot;

    freshGetAppApiRoot();
    expect(mockCreateAppApiRoot).toHaveBeenCalledTimes(1);
    expect(mockAppLoggerLog).toHaveBeenCalledTimes(1);
  });
});
