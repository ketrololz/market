import {
  type Cart,
  type MyCartUpdateAction,
} from '@commercetools/platform-sdk';
import anonymousSessionService from '../auth/anonymousSessionService';
import appLogger from '@/utils/logger';
import { parseError } from '../appErrors';
import { userTokenCache } from '@/api/localStorageTokenCache';
import { CtpClientFactory } from '@/api/ctpClientBuilderFactory';
import { isNotFoundError } from '@/utils/isNotFoundError';

const cartDraft = {
  currency: 'EUR',
};

export class CartService {
  private async getSession() {
    const storedUserToken = userTokenCache.get();
    const session = storedUserToken.token
      ? CtpClientFactory.createApiRootWithUserSession()
      : (await anonymousSessionService.ensureSession())?.apiRoot;

    if (!session) {
      throw new Error('No active session');
    }

    return session;
  }

  public async getActiveCart(): Promise<Cart | null> {
    const session = await this.getSession();

    try {
      const response = await session.me().activeCart().get().execute();

      appLogger.log(
        'CartService: Active cart retrieved via /me',
        response.body,
      );
      return response.body;
    } catch (error) {
      if (isNotFoundError(error)) return null;
      appLogger.error('CartService: Failed to get cart via /me', error);
      throw parseError(error);
    }
  }

  public async createCart(): Promise<Cart> {
    const session = await this.getSession();

    try {
      const response = await session
        .me()
        .carts()
        .post({
          body: cartDraft,
        })
        .execute();

      appLogger.log('CartService: Cart created via /me', response.body);
      return response.body;
    } catch (error) {
      appLogger.error('CartService: Failed to create cart via /me', error);
      throw parseError(error);
    }
  }

  public async deleteCart(cart: Cart): Promise<void> {
    const session = await this.getSession();

    try {
      await session
        .me()
        .carts()
        .withId({ ID: cart.id })
        .delete({ queryArgs: { version: cart.version } })
        .execute();

      appLogger.log(`CartService: Cart deleted via /me (id: ${cart.id})`);
    } catch (error) {
      appLogger.error('CartService: Failed to delete cart via /me', error);
      throw parseError(error);
    }
  }

  public async updateCart(
    cartId: string,
    version: number,
    actions: MyCartUpdateAction[],
  ): Promise<Cart> {
    const session = await this.getSession();

    try {
      const response = await session
        .me()
        .carts()
        .withId({ ID: cartId })
        .post({ body: { version, actions } })
        .execute();

      appLogger.log(
        `CartService: Cart updated via /me (id: ${cartId})`,
        response.body,
      );
      return response.body;
    } catch (error) {
      appLogger.error('CartService: Failed to update cart via /me', error);
      throw parseError(error);
    }
  }

  public async addLineItemToCart(
    productId: string,
    variantId: number,
    quantity = 1,
  ): Promise<Cart> {
    let cart = await this.getActiveCart();
    if (!cart) {
      cart = await this.createCart();
    }

    const actions: MyCartUpdateAction[] = [
      {
        action: 'addLineItem',
        productId,
        variantId,
        quantity,
      },
    ];

    return this.updateCart(cart.id, cart.version, actions);
  }
}

export const cartService = new CartService();
