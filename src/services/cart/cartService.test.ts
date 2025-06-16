import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { cartService } from '@/services/cart/cartService';
import type {
  Cart,
  MyCartUpdateAction,
  DiscountCodeReference,
} from '@commercetools/platform-sdk';

const mockCart: Cart = { id: 'cart-id', version: 1 } as Cart;
const mockUpdatedCart: Cart = { id: 'cart-id', version: 2 } as Cart;

const createMockApiRoot = (shouldThrow = false) => ({
  me: () => ({
    activeCart: () => ({
      get: vi.fn().mockReturnValue({
        execute: shouldThrow
          ? vi.fn().mockRejectedValue(new Error('Not Found'))
          : vi.fn().mockResolvedValue({ body: mockCart }),
      }),
    }),
    carts: () => ({
      post: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({ body: mockCart }),
      }),
      withId: () => ({
        delete: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue({}),
        }),
        post: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue({ body: mockUpdatedCart }),
        }),
      }),
    }),
  }),
});

vi.mock('@/api/localStorageTokenCache', () => ({
  userTokenCache: {
    get: vi.fn(() => ({ token: null })),
  },
}));

vi.mock('@/api/ctpClientBuilderFactory', () => ({
  CtpClientFactory: {
    createApiRootWithUserSession: vi.fn(() => createMockApiRoot()),
  },
}));

vi.mock('@/services/auth/anonymousSessionService', () => ({
  default: {
    ensureSession: vi.fn(() => ({ apiRoot: createMockApiRoot() })),
  },
}));

vi.mock('@/utils/logger', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/isNotFoundError', () => ({
  isNotFoundError: vi.fn(() => false),
}));

vi.mock('@/services/appErrors', () => ({
  parseError: vi.fn((e) => e),
}));

describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getActiveCart returns active cart', async () => {
    const result = await cartService.getActiveCart();
    expect(result).toEqual(mockCart);
  });

  it('getActiveCart returns null when NotFound error', async () => {
    const { isNotFoundError } = await import('@/utils/isNotFoundError');
    (isNotFoundError as Mock).mockReturnValue(true);

    const mockApiRootNotFound = createMockApiRoot(true);
    const { CtpClientFactory } = await import('@/api/ctpClientBuilderFactory');
    (CtpClientFactory.createApiRootWithUserSession as Mock).mockReturnValue(
      mockApiRootNotFound,
    );

    const { default: anonymousSessionService } = await import(
      '@/services/auth/anonymousSessionService'
    );
    (anonymousSessionService.ensureSession as Mock).mockReturnValue({
      apiRoot: mockApiRootNotFound,
    });

    const result = await cartService.getActiveCart();
    expect(result).toBeNull();
  });

  it('createCart creates a new cart', async () => {
    const result = await cartService.createCart();
    expect(result).toEqual(mockCart);
  });

  it('deleteCart deletes the cart', async () => {
    await expect(cartService.deleteCart(mockCart)).resolves.toBeUndefined();
  });

  it('updateCart updates the cart', async () => {
    const actions: MyCartUpdateAction[] = [{ action: 'recalculate' }];
    const result = await cartService.updateCart(
      mockCart.id,
      mockCart.version,
      actions,
    );
    expect(result).toEqual(mockUpdatedCart);
  });

  it('addLineItemToCart adds a line item', async () => {
    const result = await cartService.addLineItemToCart('prod-1', 1, 2);
    expect(result).toEqual(mockUpdatedCart);
  });

  it('applyDiscountCode applies discount code', async () => {
    const result = await cartService.applyDiscountCode(
      mockCart.id,
      mockCart.version,
      'SAVE10',
    );
    expect(result).toEqual(mockUpdatedCart);
  });

  it('removeDiscountCode removes discount code', async () => {
    const discountCode = {
      id: 'code-id',
      typeId: 'discount-code',
    } as DiscountCodeReference;
    const result = await cartService.removeDiscountCode(
      mockCart.id,
      mockCart.version,
      discountCode,
    );
    expect(result).toEqual(mockUpdatedCart);
  });
});
