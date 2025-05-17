import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProjectSettingsStore } from './projectSettingsStore';
import ProjectSettingsService, {
  type ProjectSettings,
} from '@/services/projectSettingsService';
import * as toasterUtils from '@/utils/toaster';
import i18n from '@/plugins/i18n';
import appLogger from '@/utils/logger';
import { ProjectSettingsFetchError } from '@/services/appErrors';
import { ProjectSettingsMessageKey } from '@/localization/i18nKeys';

vi.mock('@/services/projectSettingsService');
vi.mock('@/utils/toaster');
vi.mock('@/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key: string, params?: Record<string, unknown>) => {
        if (params && Object.keys(params).length > 0) {
          return `translated: ${key}${JSON.stringify(params)}`;
        }
        return `translated: ${key}`;
      }),
    },
  },
}));
vi.mock('@/utils/logger', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const MockProjectSettingsService = vi.mocked(ProjectSettingsService);

describe('projectSettingsStore', () => {
  let store: ReturnType<typeof useProjectSettingsStore>;

  const mockSettings: ProjectSettings = {
    name: 'Test Project',
    languages: ['en', 'de'],
    countries: ['US', 'DE'],
    currencies: ['USD', 'EUR'],
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useProjectSettingsStore();
    vi.clearAllMocks();
  });

  it('initial state is correct', () => {
    expect(store.settings).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.getAvailableLanguages).toEqual([]);
  });

  describe('fetchProjectSettings action', () => {
    it('should fetch and set project settings successfully', async () => {
      MockProjectSettingsService.getProjectSettings.mockResolvedValue(
        mockSettings,
      );

      await store.fetchProjectSettings();

      expect(ProjectSettingsService.getProjectSettings).toHaveBeenCalledTimes(
        1,
      );
      expect(store.settings).toEqual(mockSettings);
      expect(store.getProjectName).toBe(mockSettings.name);
      expect(store.getAvailableLanguages).toEqual(mockSettings.languages);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(appLogger.log).toHaveBeenCalledWith(
        'ProjectSettingsStore: Fetching project settings...',
      );
      expect(appLogger.log).toHaveBeenCalledWith(
        'ProjectSettingsStore: Project settings loaded successfully:',
        mockSettings,
      );
    });

    it('should not fetch settings if already loaded', async () => {
      store.settings = mockSettings;
      vi.mocked(ProjectSettingsService.getProjectSettings).mockClear();
      vi.mocked(appLogger.log).mockClear();

      await store.fetchProjectSettings();

      expect(ProjectSettingsService.getProjectSettings).not.toHaveBeenCalled();
      expect(appLogger.log).toHaveBeenCalledWith(
        'ProjectSettingsStore: Settings already loaded, returning cached.',
      );
      expect(store.isLoading).toBe(false);
    });

    it('should handle AppError from service correctly', async () => {
      const apiError = new ProjectSettingsFetchError({ details: 'API down' });
      MockProjectSettingsService.getProjectSettings.mockRejectedValue(apiError);

      await store.fetchProjectSettings();

      expect(store.settings).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toEqual({
        i18nKey: apiError.i18nKey,
        i18nParams: apiError.i18nParams,
        message: apiError.message,
      });
      expect(toasterUtils.showErrorToast).toHaveBeenCalledWith(
        i18n.global.t(apiError.i18nKey, apiError.i18nParams || {}),
      );
    });

    it('should handle generic Error from service correctly', async () => {
      const genericError = new Error('Something went very wrong');
      MockProjectSettingsService.getProjectSettings.mockRejectedValue(
        genericError,
      );

      await store.fetchProjectSettings();

      expect(store.settings).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toEqual({
        i18nKey: ProjectSettingsMessageKey.FetchFailed,
        i18nParams: { details: genericError.message },
        message: genericError.message,
      });
      expect(toasterUtils.showErrorToast).toHaveBeenCalledWith(
        i18n.global.t(ProjectSettingsMessageKey.FetchFailed, {
          details: genericError.message,
        }),
      );
    });

    it('should handle unknown error structure from service correctly', async () => {
      const unknownError = { weird: 'error' };
      MockProjectSettingsService.getProjectSettings.mockRejectedValue(
        unknownError,
      );

      await store.fetchProjectSettings();

      expect(store.settings).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toEqual({
        i18nKey: ProjectSettingsMessageKey.FetchFailed,
        message: 'An unknown error occurred.',
      });
      expect(toasterUtils.showErrorToast).toHaveBeenCalledWith(
        i18n.global.t(ProjectSettingsMessageKey.FetchFailed),
      );
    });

    it('should set isLoading to true during fetch and false after', async () => {
      MockProjectSettingsService.getProjectSettings.mockResolvedValue(
        mockSettings,
      );

      const fetchPromise = store.fetchProjectSettings();
      expect(store.isLoading).toBe(true);

      await fetchPromise;
      expect(store.isLoading).toBe(false);
    });
  });

  describe('getters', () => {
    it('getProjectName should return name from settings', () => {
      store.settings = mockSettings;
      expect(store.getProjectName).toBe('Test Project');
    });
    it('getProjectName should return null if settings are null', () => {
      store.settings = null;
      expect(store.getProjectName).toBeNull();
    });
  });
});
