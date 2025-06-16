import { mount } from '@vue/test-utils';
import BasePassword from '@/components/form/BasePassword.vue';
import PrimeVue from 'primevue/config';
import Password from 'primevue/password';
import Message from 'primevue/message';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import { describe, it, expect } from 'vitest';

describe('BasePassword.vue', () => {
  const defaultProps = {
    inputId: 'password',
    modelValue: '',
    placeholder: 'Enter password',
    errorMessage: '',
  };

  const globalConfig = {
    plugins: [PrimeVue],
    components: { Password, Message, InputIcon, IconField },
  };

  it('renders Password component with correct props', () => {
    const wrapper = mount(BasePassword, {
      props: { ...defaultProps },
      global: globalConfig,
    });

    const passwordComp = wrapper.findComponent(Password);
    expect(passwordComp.exists()).toBe(true);
    expect(passwordComp.attributes('id')).toBe(defaultProps.inputId);
    expect(passwordComp.props('modelValue')).toBe(defaultProps.modelValue);
    expect(passwordComp.props('placeholder')).toBe(defaultProps.placeholder);
    expect(passwordComp.props('feedback')).toBe(false);
    expect(passwordComp.props('fluid')).toBe(true);
    expect(passwordComp.props('toggleMask')).toBe(true);
  });

  it('renders icon and IconField when icon prop is provided', () => {
    const wrapper = mount(BasePassword, {
      props: { ...defaultProps, icon: 'pi-lock' },
      global: globalConfig,
    });

    expect(wrapper.findComponent(IconField).exists()).toBe(true);

    const inputIcon = wrapper.findComponent(InputIcon);
    expect(inputIcon.exists()).toBe(true);
    expect(inputIcon.classes()).toContain('pi');
    expect(inputIcon.classes()).toContain('pi-lock');
  });

  it('does not render IconField when icon prop is not provided', () => {
    const wrapper = mount(BasePassword, {
      props: { ...defaultProps },
      global: globalConfig,
    });

    expect(wrapper.findComponent(IconField).exists()).toBe(false);
  });

  it('renders error message when errorMessage prop is provided', () => {
    const errorMessage = 'Password is required';
    const wrapper = mount(BasePassword, {
      props: { ...defaultProps, errorMessage },
      global: globalConfig,
    });

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.text()).toBe(errorMessage);
  });

  it('renders error message when errorMessage prop is an object with message field', () => {
    const errorObj = { message: 'Invalid password' };
    const wrapper = mount(BasePassword, {
      props: { ...defaultProps, errorMessage: errorObj },
      global: globalConfig,
    });

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.text()).toBe(errorObj.message);
  });
});
