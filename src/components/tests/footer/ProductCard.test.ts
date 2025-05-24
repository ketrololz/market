import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { router } from '../../../router/router';
import PrimeVue from 'primevue/config';
import { Card } from 'primevue';
import ProductCard from '@/components/product-card/ProductCard.vue';

const cardInfo = {
  image: './images/test-image.webp',
  title: 'test-title',
  description: 'test-description',
  price: '999',
  isAvailable: true,
  route: '/',
};

describe('ProductCard', () => {
  it('Contains product card info', () => {
    const wrapper = mount(ProductCard, {
      global: {
        plugins: [PrimeVue, router],
      },
      props: {
        cardInfo: cardInfo,
      },
    });

    expect(wrapper.findComponent(Card).exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('h2').text()).toBe('test-title');
    expect(wrapper.find('h4').text()).toBe('test-description');
    expect(wrapper.find('p').text()).toContain('999');
  });
});
