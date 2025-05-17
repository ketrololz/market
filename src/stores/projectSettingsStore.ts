import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ProjectSettingsService, {
  type ProjectSettings,
} from '@/services/project/projectSettingsService';
import appLogger from '@/utils/logger';
import { showErrorToast } from '@/utils/toaster';
import i18n from '@/plugins/i18n';
import { AppError } from '@/services/appErrors';
import { ProjectSettingsMessageKey } from '@/localization/i18nKeys';

interface SettingsStoreError {
  i18nKey: ProjectSettingsMessageKey | string;
  i18nParams?: Record<string, unknown>;
  message?: string;
}

/**
 * The store for project settings.
 */
export const useProjectSettingsStore = defineStore('projectSettings', () => {
  // --- State ---
  const settings = ref<ProjectSettings | null>(null);
  const isLoading = ref(false);
  const error = ref<SettingsStoreError | null>(null);

  // --- Getters ---
  const getProjectName = computed(() => settings.value?.name || null);
  const getLanguages = computed(() => settings.value?.languages || []);
  const getCountries = computed(() => settings.value?.countries || []);
  const getCurrencies = computed(() => settings.value?.currencies || []);
  const isLoadingSettings = computed(() => isLoading.value);
  const settingsErrorDetails = computed(() => error.value);

  // --- Actions ---
  /**
   * Fetch the project settings from the API.
   */
  async function fetchProjectSettings() {
    if (settings.value) {
      appLogger.log(
        'ProjectSettingsStore: Settings already loaded, returning cached.',
      );
      return;
    }
    isLoading.value = true;
    error.value = null;
    appLogger.log('ProjectSettingsStore: Fetching project settings...');
    try {
      const fetchedSettings = await ProjectSettingsService.getProjectSettings();
      settings.value = fetchedSettings;
      appLogger.log(
        'ProjectSettingsStore: Project settings loaded successfully:',
        fetchedSettings,
      );
    } catch (e: unknown) {
      appLogger.error(
        'ProjectSettingsStore: Error fetching project settings',
        e,
      );
      let errorPayload: SettingsStoreError;
      if (e instanceof AppError) {
        errorPayload = {
          i18nKey: e.i18nKey,
          i18nParams: e.i18nParams,
          message: e.message,
        };
      } else if (e instanceof Error) {
        errorPayload = {
          i18nKey: ProjectSettingsMessageKey.FetchFailed,
          i18nParams: { details: e.message },
          message: e.message,
        };
      } else {
        errorPayload = {
          i18nKey: ProjectSettingsMessageKey.FetchFailed,
          message: 'An unknown error occurred.',
        };
      }
      error.value = errorPayload;
      showErrorToast(
        i18n.global.t(errorPayload.i18nKey, errorPayload.i18nParams || {}),
      );
    } finally {
      isLoading.value = false;
    }
  }

  return {
    settings,
    isLoading,
    error,
    getProjectName,
    getAvailableLanguages: getLanguages,
    getAvailableCountries: getCountries,
    getAvailableCurrencies: getCurrencies,
    isLoadingSettings,
    settingsErrorDetails,
    fetchProjectSettings,
  };
});
