import { createI18n, type LocaleMessages } from 'vue-i18n';

import enMessages from '@/locales/en.json';
import ruMessages from '@/locales/ru.json';

export type MessageSchema = typeof enMessages;

export type AvailableLocale = 'en' | 'ru';

const messages: Record<AvailableLocale, MessageSchema> = {
  en: enMessages,
  ru: ruMessages,
};

function getStartingLocale(): AvailableLocale {
  const savedLocale = localStorage.getItem(
    'app-locale',
  ) as AvailableLocale | null;
  if (
    savedLocale &&
    (Object.keys(messages) as AvailableLocale[]).includes(savedLocale)
  ) {
    return savedLocale;
  }
  return 'ru';
}

const i18nOptions = {
  legacy: false,
  locale: getStartingLocale(),
  fallbackLocale: 'en',
  messages: messages as LocaleMessages<MessageSchema>,
};

const i18n = createI18n(i18nOptions);

export default i18n;
