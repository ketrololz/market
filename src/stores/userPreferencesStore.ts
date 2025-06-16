import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export enum categoriesLanguages {
  ru = 'ru',
  en = 'en',
}

export const useUserPreferencesStore = defineStore('userPreferences', () => {
  const language = ref<categoriesLanguages>();

  const currentLanguage = computed(
    () => language.value || categoriesLanguages.en,
  );

  function setLanguage(userLanguage: categoriesLanguages) {
    language.value = userLanguage;
  }

  return {
    currentLanguage,
    setLanguage,
  };
});
