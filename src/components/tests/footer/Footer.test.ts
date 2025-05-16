import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { router } from '../../../router/router';
import Footer from '../../footer/Footer.vue';
import PrimeVue from 'primevue/config';

describe('Footer', () => {
  it('Contains github links', () => {
    const wrapper = mount(Footer, {
      global: {
        plugins: [PrimeVue, router],
      },
    });

    expect(wrapper.text()).toContain('2025 RPG Heroes');
  });
});
