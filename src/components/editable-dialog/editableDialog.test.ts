import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EditableDialog from './EditableDialog.vue';

const DialogStub = {
  props: ['visible', 'header'],
  emits: ['update:visible'],
  template: `
    <div v-if="visible" class="dialog">
      <header>{{ header }}</header>
      <slot></slot>
      <footer><slot name="footer"></slot></footer>
    </div>
  `,
};

const ButtonStub = {
  template: `<button><slot /></button>`,
};

describe('EditableDialog.vue', () => {
  it('renders header and default slot content', () => {
    const wrapper = mount(EditableDialog, {
      props: {
        title: 'Edit User',
        modelValue: true,
        edit: true,
      },
      slots: {
        default: '<div class="custom-slot">Test content</div>',
      },
      global: {
        stubs: {
          Dialog: DialogStub,
          Button: ButtonStub,
        },
      },
    });

    expect(wrapper.find('.dialog header').text()).toContain('Edit User');
    expect(wrapper.find('p').text()).toBe('Please edit the information below.');
    expect(wrapper.find('.custom-slot').exists()).toBe(true);
  });

  it('renders footer buttons and emits events', async () => {
    const formRefMock = {
      isValid: { value: true },
      submit: vi.fn(),
    };

    const wrapper = mount(EditableDialog, {
      props: {
        title: 'Edit User',
        modelValue: true,
        edit: true,
        formRef: formRefMock,
      },
      global: {
        stubs: {
          Dialog: DialogStub,
          Button: ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll('button');

    await buttons[1].trigger('click');
    await buttons[0].trigger('click');

    const emitted = wrapper.emitted();

    expect(emitted['submit']).toBeTruthy();
    expect(emitted['update:modelValue']).toEqual([[false]]);
  });
});
