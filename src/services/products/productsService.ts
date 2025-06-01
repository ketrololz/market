import appLogger from '@utils/logger';
import {
  type ProductProjection,
  type ByProjectKeyRequestBuilder,
} from '@commercetools/platform-sdk';
import { getAppApiRoot } from '@api/ctpClient';
import { parseError } from '@services/appErrors';
import { useProjectSettingsStore } from '@/stores/projectSettingsStore';

const settingsStore = useProjectSettingsStore();

export interface ProductDetailOptions {
  expand?: string | string[];
  staged?: boolean;
}

export interface ProductIdentifier {
  type: 'id' | 'key' | 'slug';
  value: string;
}

class ProductsService {
  private apiRoot: ByProjectKeyRequestBuilder;

  constructor() {
    this.apiRoot = getAppApiRoot();
  }

  async fetchProduct(
    identifier: ProductIdentifier,
    options: ProductDetailOptions = {},
  ): Promise<ProductProjection | null> {
    appLogger.log(
      `ProductsService: Fetching product by ${identifier.type}: ${identifier.value}`,
    );
    const { expand = [], staged = false } = options;
    const defaultExpandList = [
      'masterVariant.prices[*].discounted',
      'variants[*].prices[*].discounted',
    ];
    const finalExpand = Array.isArray(expand)
      ? [...new Set([...defaultExpandList, ...expand])]
      : [...new Set([...defaultExpandList, expand])];

    try {
      let requestBuilder;

      if (identifier.type === 'id') {
        requestBuilder = this.apiRoot
          .productProjections()
          .withId({ ID: identifier.value });
      } else if (identifier.type === 'key') {
        requestBuilder = this.apiRoot
          .productProjections()
          .withKey({ key: identifier.value });
      } else if (identifier.type === 'slug') {
        const locales = settingsStore.getAvailableLanguages;
        for (const locale of locales) {
          const queryArgs = {
            where: `slug(${locale}="${identifier.value}")`,
            limit: 1,
            staged,
            expand: finalExpand.length > 0 ? finalExpand : undefined,
          };
          const response = await this.apiRoot
            .productProjections()
            .get({ queryArgs })
            .execute();
          if (response.body.results.length > 0) {
            appLogger.log(
              `ProductsService: Product (Slug: ${identifier.value}) fetched successfully in locale ${locale}.`,
            );
            return response.body.results[0];
          }
        }
        appLogger.warn(
          `ProductsService: Product with Slug ${identifier.value} not found in any locale.`,
        );
        return null;
      } else {
        throw new Error('Invalid product identifier type');
      }

      const response = await requestBuilder
        .get({
          queryArgs: {
            staged,
            expand: finalExpand.length > 0 ? finalExpand : undefined,
          },
        })
        .execute();
      appLogger.log(
        `ProductsService: Product (${identifier.type}: ${identifier.value}) fetched successfully.`,
      );
      return response.body;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'statusCode' in error &&
        (error as { statusCode: number }).statusCode === 404
      ) {
        appLogger.warn(
          `ProductsService: Product with identifier ${identifier.value} not found.`,
        );
        return null;
      }
      appLogger.error(
        `ProductsService: Error fetching product by identifier ${identifier.value}:`,
        error,
      );
      throw parseError(error);
    }
  }
}

export { ProductsService };
export default new ProductsService();
