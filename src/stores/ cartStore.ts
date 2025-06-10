import { defineStore } from 'pinia';
import { ref } from 'vue';
import { cartService } from '@/services/cart/cartService';
import type { Cart, MyCartUpdateAction } from '@commercetools/platform-sdk';

export const useCartStore = defineStore('cart', () => {
  const cart = ref<Cart | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  async function loadCart() {
    isLoading.value = true;
    error.value = null;

    try {
      const existingCart = await cartService.getActiveCart();
      cart.value = existingCart ?? (await cartService.createCart());
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
    } finally {
      isLoading.value = false;
    }
  }

  async function clearCart() {
    if (!cart.value) return;

    try {
      await cartService.deleteCart(cart.value);
    } catch {
      // Ошибку можно игнорировать
    } finally {
      cart.value = null;
    }
  }

  async function updateCart(actions: MyCartUpdateAction[]) {
    if (!cart.value) throw new Error('Cart not loaded');

    try {
      const updatedCart = await cartService.updateCart(
        cart.value.id,
        cart.value.version,
        actions,
      );
      cart.value = updatedCart;
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to update cart');
      throw err;
    }
  }

  async function addLineItem(
    productId: string,
    variantId: number,
    quantity = 1,
  ) {
    isLoading.value = true;
    error.value = null;

    try {
      const updatedCart = await cartService.addLineItemToCart(
        productId,
        variantId,
        quantity,
      );
      cart.value = updatedCart;
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to add item to cart');
      throw err;
    } finally {
      isLoading.value = false;
    }
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
