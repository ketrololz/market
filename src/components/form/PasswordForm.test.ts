import { mount } from '@vue/test-utils';
import PasswordForm from '@/components/form/PasswordForm.vue';
import type { PasswordFormData } from '@/components/form/PasswordForm.vue';
import PrimeVue from 'primevue/config';
import BasePassword from '@/components/form/BasePassword.vue';
import { describe, it, expect } from 'vitest';

describe('PasswordForm.vue', () => {
  const globalConfig = {
    plugins: [PrimeVue],
    components: { BasePassword },
  };

  it('renders form fields and emits submit event on valid form', async () => {
    const wrapper = mount(PasswordForm, {
      global: globalConfig,
    });

    const currentInput = wrapper.find('#current-password input');
    const newInput = wrapper.find('#new-password input');

    expect(currentInput.exists()).toBe(true);
    expect(newInput.exists()).toBe(true);

    await currentInput.setValue('Current123!');
    await newInput.setValue('NewPassword456!');

    // Триггерим событие сабмита формы
    await wrapper.find('form').trigger('submit');

    // Ждем, чтобы все промисы отработали (если нужно)
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('submit')).toBeTruthy();

    const emittedData = wrapper.emitted('submit')![0][0] as PasswordFormData;
    expect(emittedData.currentPassword).toBe('Current123!');
    expect(emittedData.newPassword).toBe('NewPassword456!');
  });

  it('does not emit submit event if form is invalid', async () => {
    const wrapper = mount(PasswordForm, {
      global: globalConfig,
    });

    // Сабмитим пустую форму (невалидную)
    await wrapper.find('form').trigger('submit');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('submit')).toBeFalsy();
  });
});
