import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { nextTick } from 'vue';
import { useCountries } from '@/composables/useCountries';
import { useI18n } from 'vue-i18n';
import { useProjectSettingsStore } from '@/stores/projectSettingsStore';

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(),
}));

vi.mock('@/stores/projectSettingsStore', () => ({
  useProjectSettingsStore: vi.fn(),
}));

describe('useCountries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns sorted country list in Russian locale', async () => {
    (useI18n as Mock).mockReturnValue({ locale: { value: 'ru' } });
    (useProjectSettingsStore as unknown as Mock).mockReturnValue({
      getAvailableCountries: ['US', 'RU', 'DE'],
    });

    const { countries } = useCountries();

    await nextTick();

    expect(countries.value).toEqual([
      { code: 'DE', name: 'Германия' },
      { code: 'RU', name: 'Российская Федерация' },
      { code: 'US', name: 'США' },
    ]);
  });

  it('returns sorted country list in English locale by default', async () => {
    (useI18n as Mock).mockReturnValue({ locale: { value: 'en' } });
    (useProjectSettingsStore as unknown as Mock).mockReturnValue({
      getAvailableCountries: ['RU', 'US', 'DE'],
    });

    const { countries } = useCountries();

    await nextTick();

    expect(countries.value).toEqual([
      { code: 'DE', name: 'Germany' },
      { code: 'RU', name: 'Russian Federation' },
      { code: 'US', name: 'United States of America' },
    ]);
  });

  it('returns code as name if country name is not found', async () => {
    (useI18n as Mock).mockReturnValue({ locale: { value: 'en' } });
    (useProjectSettingsStore as unknown as Mock).mockReturnValue({
      getAvailableCountries: ['ZZ'],
    });

    const { countries } = useCountries();

    await nextTick();

    expect(countries.value).toEqual([{ code: 'ZZ', name: 'ZZ' }]);
  });
});
