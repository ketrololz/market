import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectSettingsStore } from '@/stores/projectSettingsStore';

import countriesLib from 'i18n-iso-countries';
import countriesEn from 'i18n-iso-countries/langs/en.json';
import countriesRu from 'i18n-iso-countries/langs/ru.json';

countriesLib.registerLocale(countriesEn);
countriesLib.registerLocale(countriesRu);

export function useCountries() {
  const { locale } = useI18n();
  const projectSettingsStore = useProjectSettingsStore();
  const countries = computed(() => {
    const codes = projectSettingsStore.getAvailableCountries;
    const lang = locale.value.startsWith('ru') ? 'ru' : 'en';

    return codes
      .map((code) => ({
        code,
        name: countriesLib.getName(code, lang, { select: 'official' }) || code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  return { countries };
}
