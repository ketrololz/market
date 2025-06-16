import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import PrimeVue from 'primevue/config';
import BaseTextInput from './BaseTextInput.vue';

describe('BaseTextInput.vue', () => {
  const globalConfig = {
    plugins: [PrimeVue],
  };

  it('renders input with icon and handles modelValue and event', async () => {
    const wrapper = mount(BaseTextInput, {
      props: {
        modelValue: 'test value',
        inputId: 'input1',
        icon: 'pi-user',
        placeholder: 'Enter text',
      },
      global: globalConfig,
    });

    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.element.value).toBe('test value');

    await input.setValue('new value');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value']);
  });

  it('renders input without icon and shows error message', () => {
    const errorMessage = 'Required field';
    const wrapper = mount(BaseTextInput, {
      props: {
        modelValue: '',
        inputId: 'input2',
        placeholder: 'Enter text',
        errorMessage,
      },
      global: globalConfig,
    });

    expect(wrapper.find('.pi').exists()).toBe(false);
    expect(wrapper.text()).toContain(errorMessage);
  });

  it('formats Date modelValue as ISO string', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    const wrapper = mount(BaseTextInput, {
      props: {
        modelValue: date,
        inputId: 'input3',
      },
      global: globalConfig,
    });

    const input = wrapper.find('input');
    expect(input.element.value).toBe(date.toISOString());
  });
});
