// src/components/common/LanguageSwitcher.vue (example path)
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectSettingsStore } from '@/stores/projectSettingsStore';
import Select from 'primevue/select';
import type { AvailableLocale } from '@/plugins/i18n';

const { locale, availableLocales: i18nAvailableLocales } = useI18n();
const projectSettingsStore = useProjectSettingsStore();

const languageOptions = computed(() => {
  const supportedProjectLanguages =
    projectSettingsStore.getAvailableLanguages.filter((langCode) =>
      (i18nAvailableLocales as unknown as string[]).includes(langCode),
    );

  return supportedProjectLanguages.map((langCode) => ({
    name: getLanguageDisplayName(langCode as AvailableLocale),
    code: langCode as AvailableLocale,
  }));
});

const selectedLanguage = computed<AvailableLocale | undefined>({
  get: () => locale.value as AvailableLocale,
  set: (newLocale) => {
    if (newLocale) {
      locale.value = newLocale;
      localStorage.setItem('app-locale', newLocale);
    }
  },
});

function getLanguageDisplayName(langCode: AvailableLocale): string {
  switch (langCode) {
    case 'en':
      return 'English';
    case 'ru':
      return 'Русский';
    default:
      return langCode as string;
  }
}
</script>

<template>
  <div v-if="languageOptions.length > 1" class="language-switcher">
    <Select
      v-model="selectedLanguage"
      :options="languageOptions"
      option-label="name"
      option-value="code"
      placeholder="Select Language"
      class="w-full md:w-14rem p-inputtext-sm"
      :pt="{
        root: '!w-full !p-1',
        label: '!p-1',
        dropdownIcon: '!w-4 !h-4',
      }"
    />
  </div>
</template>
