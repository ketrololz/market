import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ProjectSettingsService from '@/services/projectSettingsService';
import appLogger from '@/utils/logger';
import { showErrorToast } from '@/utils/toaster';
import i18n from '@/plugins/i18n';
import { AuthError } from '@/services/authErrors';
import { AuthMessageKey } from '@/localization/i18nKeys';

// interface ProjectSettingsState {
//   projectName: string | null;
//   availableLanguages: string[];
//   availableCountries: string[];
//   availableCurrencies: string[];
//   isLoading: boolean;
//   error: string | null;
// }

export const useProjectSettingsStore = defineStore('projectSettings', () => {
  // --- State ---
  const projectName = ref<string | null>(null);
  const availableLanguages = ref<string[]>([]);
  const availableCountries = ref<string[]>([]);
  const availableCurrencies = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // --- Getters ---
  const getProjectName = computed(() => projectName.value);
  const getAvailableLanguages = computed(() => availableLanguages.value);
  const getAvailableCountries = computed(() => availableCountries.value);
  const getAvailableCurrencies = computed(() => availableCurrencies.value);
  const isLoadingSettings = computed(() => isLoading.value);
  const settingsError = computed(() => error.value);

  // --- Actions ---
  async function fetchProjectSettings() {
    if (projectName.value && availableLanguages.value.length > 0) {
      appLogger.log(
        'ProjectSettingsStore: Settings already loaded, returning cached.',
      );
      return;
    }

    isLoading.value = true;
    error.value = null;
    appLogger.log('ProjectSettingsStore: Fetching project settings...');
    try {
      const settings = await ProjectSettingsService.getProjectSettings();
      if (settings) {
        projectName.value = settings.name;
        availableLanguages.value = settings.languages;
        availableCountries.value = settings.countries;
        availableCurrencies.value = settings.currencies;
        appLogger.log(
          'ProjectSettingsStore: Project settings loaded successfully:',
          settings,
        );
      }
    } catch (e: unknown) {
      appLogger.error(
        'ProjectSettingsStore: Error fetching project settings',
        e,
      );
      let errorMessageKey = AuthMessageKey.UnknownError;
      let errorParams: Record<string, unknown> | undefined = undefined;

      if (e instanceof AuthError) {
        errorMessageKey = e.i18nKey as AuthMessageKey;
        errorParams = e.i18nParams;
      } else if (e instanceof Error) {
        errorParams = { details: e.message };
      }

      const translatedError = i18n.global.t(errorMessageKey, errorParams || {});
      error.value = translatedError;
      showErrorToast(translatedError);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    projectName,
    availableLanguages,
    availableCountries,
    availableCurrencies,
    isLoading,
    error,
    getProjectName,
    getAvailableLanguages,
    getAvailableCountries,
    getAvailableCurrencies,
    isLoadingSettings,
    settingsError,
    fetchProjectSettings,
  };
});
