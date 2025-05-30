import { getAppApiRoot } from '@/api/ctpClient';
import appLogger from '@/utils/logger';
import { parseError } from '../appErrors';
import { categoriesLanguages } from '@/stores/userPreferencesStore';

export interface productProperties {
  limit: number;
  offset: number;
  categoryId?: string;
  sort?: string;
  language?: categoriesLanguages;
  searchText?: string;
  priceMin: number;
  priceMax: number;
  isDiscounted?: boolean;
  currency: currency;
}

export enum currency {
  'en' = 'EUR',
  'ru' = 'RUB',
  'usd' = 'USD',
}

class productsService {
  apiRoot = getAppApiRoot();

  async fetchCategories() {
    appLogger.log('App.vue: Fetching products...');
    try {
      const response = await this.apiRoot
        .categories()
        .get({
          queryArgs: {
            limit: 100,
            sort: 'name.ru asc',
          },
        })
        .execute();
      const results = response.body.results;
      return results;
    } catch (error) {
      appLogger.error('App.vue: Error fetching categories:', error);
      const parsed = parseError(error);
      throw new Error(parsed.message);
      // errorMessage.value = parsed.message;
    }
  }

  async fetchProductsPrice(categoryId: string, price: string = 'EUR') {
    try {
      const filters = [];
      if (categoryId !== '0') {
        filters.push(`categories.id:"${categoryId}"`);
      }

      const response = await this.apiRoot
        .productProjections()
        .search()
        .get({
          queryArgs: {
            filter: filters,
            facet: ['variants.price.centAmount'],
            limit: 500,
            staged: false,
            priceCurrency: 'EUR',
          },
        })
        .execute();

      const prices = response.body.results.reduce(
        (acc, elem) => {
          if (elem.masterVariant.prices) {
            const priceObj = elem.masterVariant.prices;
            const centAmount = priceObj.filter(
              (el) => el.value.currencyCode === price,
            )[0].value.centAmount;
            acc.push(centAmount / 100);
          }

          return acc;
        },
        <number[]>[],
      );

      return {
        priceMin: Math.min(...prices),
        priceMax: Math.max(...prices),
      };
    } catch (error: unknown) {
      appLogger.error('App.vue: Error fetching products:', error);
      const parsed = parseError(error);
      throw new Error(parsed.message);
    }
  }

  async fetchProductsPageByCategory(product: productProperties) {
    appLogger.log('App.vue: Fetching products...');
    try {
      const filters = [
        `variants.prices.value.centAmount:range(${product.priceMin * 100} to ${product.priceMax * 100})`,
        `variants.prices.value.currencyCode:"${product.currency}"`,
      ];
      if (product.categoryId !== '0') {
        filters.push(`categories.id:"${product.categoryId}"`);
      }
      if (product.isDiscounted) {
        filters.push(`variants.scopedPrice.discounted:*`);
      }
      const args = {
        filter: filters,
        limit: product.limit,
        staged: false,
        offset: product.offset,
        sort: product.sort,
        [`text.${product.language}`]: product.searchText,
        fuzzy: true,
      };
      const response = await this.apiRoot
        .productProjections()
        .search()
        .get({
          queryArgs: args,
        })
        .execute();
      const result = response.body;
      appLogger.log('App.vue: Products fetched:', result);
      return result;
    } catch (error: unknown) {
      appLogger.error('App.vue: Error fetching products:', error);
      const parsed = parseError(error);
      throw new Error(parsed.message);
      // errorMessage.value = parsed.message;
    }
  }
}

export { productsService };
export default new productsService();
