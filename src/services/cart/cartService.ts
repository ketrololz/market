import {
  type Cart,
  type MyCartUpdateAction,
} from '@commercetools/platform-sdk';
import anonymousSessionService from '../auth/anonymousSessionService';
import appLogger from '@/utils/logger';
import { parseError } from '../appErrors';
import { userTokenCache } from '@/api/localStorageTokenCache';
import { CtpClientFactory } from '@/api/ctpClientBuilderFactory';

export class CartService {
  public async getActiveCart(): Promise<Cart | null> {
    const storedUserToken = userTokenCache.get();
    const session = storedUserToken.token
      ? CtpClientFactory.createApiRootWithUserSession()
      : (await anonymousSessionService.ensureSession())?.apiRoot;
    if (!session) return null;
    try {
      const response = await session.me().activeCart().get().execute();

      appLogger.log(
        'CartService: Active cart retrieved via /me',
        response.body,
      );
      return response.body;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        error.statusCode === 404
      )
        return null;
      appLogger.error('CartService: Failed to get cart via /me', error);
      throw parseError(error);
    }
  }

  public async createCart(): Promise<Cart> {
    const storedUserToken = userTokenCache.get();
    const session = storedUserToken.token
      ? CtpClientFactory.createApiRootWithUserSession()
      : (await anonymousSessionService.ensureSession())?.apiRoot;
    if (!session) throw new Error('No active session');

    try {
      const response = await session
        .me()
        .carts()
        .post({
          body: {
            currency: 'EUR',
          },
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
    const storedUserToken = userTokenCache.get();
    const session = storedUserToken.token
      ? CtpClientFactory.createApiRootWithUserSession()
      : (await anonymousSessionService.ensureSession())?.apiRoot;
    if (!session) throw new Error('No active session');

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
    const storedUserToken = userTokenCache.get();
    const session = storedUserToken.token
      ? CtpClientFactory.createApiRootWithUserSession()
      : (await anonymousSessionService.ensureSession())?.apiRoot;
    if (!session) throw new Error('No active session');

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
