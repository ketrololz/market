import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from './cartStore';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { cartService } from '@/services/cart/cartService';
import type { Cart, MyCartUpdateAction } from '@commercetools/platform-sdk';

vi.mock('@/services/cart/cartService', () => ({
  cartService: {
    getActiveCart: vi.fn(),
    createCart: vi.fn(),
    deleteCart: vi.fn(),
    updateCart: vi.fn(),
    addLineItemToCart: vi.fn(),
    applyDiscountCode: vi.fn(),
    removeDiscountCode: vi.fn(),
  },
}));

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('loads existing cart if available', async () => {
    const mockCart = { id: 'cart1', version: 1 } as Cart;
    (cartService.getActiveCart as Mock).mockResolvedValue(mockCart);

    const store = useCartStore();
    await store.loadCart();

    expect(store.cart).toEqual(mockCart);
  });

  it('creates cart if none exists', async () => {
    const mockCart = { id: 'cart2', version: 1 } as Cart;
    (cartService.getActiveCart as Mock).mockResolvedValue(null);
    (cartService.createCart as Mock).mockResolvedValue(mockCart);

    const store = useCartStore();
    await store.loadCart();

    expect(store.cart).toEqual(mockCart);
  });

  it('clears the cart', async () => {
    const mockCart = { id: 'cart3', version: 1 } as Cart;
    const store = useCartStore();
    store.cart = mockCart;

    await store.clearCart();

    expect(cartService.deleteCart).toHaveBeenCalledWith(mockCart);
    expect(store.cart).toBeNull();
  });

  it('updates the cart with actions', async () => {
    const mockCart = { id: 'cart4', version: 2 } as Cart;
    const updatedCart = { id: 'cart4', version: 3 } as Cart;
    const actions: MyCartUpdateAction[] = [{ action: 'recalculate' }];

    const store = useCartStore();
    store.cart = mockCart;
    (cartService.updateCart as Mock).mockResolvedValue(updatedCart);

    await store.updateCart(actions);

    expect(cartService.updateCart).toHaveBeenCalledWith(
      mockCart.id,
      mockCart.version,
      actions,
    );
    expect(store.cart).toEqual(updatedCart);
  });

  it('adds line item to cart', async () => {
    const updatedCart = { id: 'cart5', version: 1 } as Cart;
    (cartService.addLineItemToCart as Mock).mockResolvedValue(updatedCart);

    const store = useCartStore();
    await store.addLineItem('productId', 1, 2);

    expect(cartService.addLineItemToCart).toHaveBeenCalledWith(
      'productId',
      1,
      2,
    );
    expect(store.cart).toEqual(updatedCart);
  });

  it('removes line item from cart', async () => {
    const mockCart = { id: 'cart6', version: 1 } as Cart;
    const updatedCart = { id: 'cart6', version: 2 } as Cart;

    const store = useCartStore();
    store.cart = mockCart;
    (cartService.updateCart as Mock).mockResolvedValue(updatedCart);

    await store.removeLineItem('lineItemId');

    expect(cartService.updateCart).toHaveBeenCalledWith(
      mockCart.id,
      mockCart.version,
      [{ action: 'removeLineItem', lineItemId: 'lineItemId' }],
    );
    expect(store.cart).toEqual(updatedCart);
  });

  it('applies discount code', async () => {
    const mockCart = { id: 'cart7', version: 1 } as Cart;
    const updatedCart = { id: 'cart7', version: 2 } as Cart;
    (cartService.applyDiscountCode as Mock).mockResolvedValue(updatedCart);

    const store = useCartStore();
    store.cart = mockCart;

    await store.applyDiscountCode('DISCOUNT2025');

    expect(cartService.applyDiscountCode).toHaveBeenCalledWith(
      mockCart.id,
      mockCart.version,
      'DISCOUNT2025',
    );
    expect(store.cart).toEqual(updatedCart);
  });

  it('removes discount code', async () => {
    const mockCart = { id: 'cart8', version: 1 } as Cart;
    const updatedCart = { id: 'cart8', version: 2 } as Cart;
    const discountCode: import('@commercetools/platform-sdk').DiscountCodeReference =
      { id: 'code1', typeId: 'discount-code' };

    (cartService.removeDiscountCode as Mock).mockResolvedValue(updatedCart);

    const store = useCartStore();
    store.cart = mockCart;

    await store.removeDiscountCode(discountCode);

    expect(cartService.removeDiscountCode).toHaveBeenCalledWith(
      mockCart.id,
      mockCart.version,
      discountCode,
    );
    expect(store.cart).toEqual(updatedCart);
  });
});
