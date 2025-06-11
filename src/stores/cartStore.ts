import { defineStore } from 'pinia';
import { ref } from 'vue';
import { cartService } from '@/services/cart/cartService';
import type { Cart, MyCartUpdateAction } from '@commercetools/platform-sdk';

export const useCartStore = defineStore('cart', () => {
  const cart = ref<Cart | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  function setError(err: unknown, fallbackMessage: string) {
    error.value = err instanceof Error ? err : new Error(fallbackMessage);
  }

  async function withLoading<T>(
    fn: () => Promise<T>,
    fallbackMessage: string,
  ): Promise<T> {
    isLoading.value = true;
    error.value = null;

    try {
      return await fn();
    } catch (err) {
      setError(err, fallbackMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadCart() {
    cart.value = await withLoading(async () => {
      const existingCart = await cartService.getActiveCart();
      return existingCart ?? (await cartService.createCart());
    }, 'Failed to load cart');
  }

  async function clearCart() {
    if (!cart.value) return;

    await withLoading(async () => {
      await cartService.deleteCart(cart.value!);
      cart.value = null;
    }, 'Failed to clear cart');
  }

  async function updateCart(actions: MyCartUpdateAction[]) {
    if (!cart.value) throw new Error('Cart not loaded');

    cart.value = await withLoading(async () => {
      return await cartService.updateCart(
        cart.value!.id,
        cart.value!.version,
        actions,
      );
    }, 'Failed to update cart');
  }

  async function addLineItem(
    productId: string,
    variantId: number,
    quantity = 1,
  ) {
    const updatedCart = await withLoading(
      () => cartService.addLineItemToCart(productId, variantId, quantity),
      'Failed to add item to cart',
    );
    cart.value = updatedCart;
  }

  return {
    cart,
    isLoading,
    error,
    loadCart,
    clearCart,
    updateCart,
    addLineItem,
  };
});
