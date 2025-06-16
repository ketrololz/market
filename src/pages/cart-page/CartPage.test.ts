import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CartPage from './CartPage.vue';

vi.mock('primevue/stepper', () => ({
  default: { name: 'Stepper', template: '<div><slot /></div>' },
}));
vi.mock('primevue/steplist', () => ({
  default: { name: 'StepList', template: '<div><slot /></div>' },
}));
vi.mock('primevue/steppanels', () => ({
  default: { name: 'StepPanels', template: '<div><slot /></div>' },
}));
vi.mock('primevue/step', () => ({
  default: { name: 'Step', template: '<div><slot /></div>' },
}));
vi.mock('primevue/steppanel', () => ({
  default: { name: 'StepPanel', template: '<div><slot /></div>' },
}));
vi.mock('primevue', async () => {
  const Button = (await import('primevue/button')).default;
  return { Button };
});

describe('CartPage.vue', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(CartPage, {
      global: {
        stubs: {
          CartStep: {
            name: 'CartStep',
            template: '<div class="mock-cart-step">CartStep Component</div>',
          },
        },
      },
    });
  });

  it('renders order title', () => {
    expect(wrapper.text()).toContain('Order');
  });

  it('renders 4 step labels', () => {
    const text = wrapper.text();
    expect(text).toContain('Cart');
    expect(text).toContain('Billing and Shipping Address');
    expect(text).toContain('Shipping and Payment Method');
    expect(text).toContain('Summary');
  });

  it('renders CartStep component', () => {
    const cartStep = wrapper.find('.mock-cart-step');
    expect(cartStep.exists()).toBe(true);
    expect(cartStep.text()).toBe('CartStep Component');
  });

  it('renders Continue button', () => {
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Continue to Address');
  });

  it('Continue button is clickable', async () => {
    const button = wrapper.find('button');
    await button.trigger('click');
    expect(button.exists()).toBe(true);
  });
});
