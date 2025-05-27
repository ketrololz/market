import { getAppApiRoot } from '@/api/ctpClient';
import appLogger from '@/utils/logger';
import { parseError } from '../appErrors';

export enum categoriesLanguages {
  ru = 'ru',
  en = 'en',
}

class productsService {
  apiRoot = getAppApiRoot();

  async fetchCategories(language: categoriesLanguages) {
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
      const categories = results.map(
        (categoryObj) => categoryObj.name[language],
      );
      return categories;
    } catch (error) {
      appLogger.error('App.vue: Error fetching categories:', error);
      const parsed = parseError(error);
      throw new Error(parsed.message);
      // errorMessage.value = parsed.message;
    }
  }

  async fetchProducts() {
    appLogger.log('App.vue: Fetching products...');
    try {
      const response = await this.apiRoot

        .productProjections()
        .get({
          queryArgs: {
            limit: 500,
            staged: false,
          },
        })
        .execute();
      const result = response.body.results;
      return result;
      appLogger.log('App.vue: Products fetched:', result);
    } catch (error: unknown) {
      appLogger.error('App.vue: Error fetching products:', error);
      const parsed = parseError(error);
      throw new Error(parsed.message);
      // errorMessage.value = parsed.message;
    }
  }

  async fetchProductsPage(limit: number, offset: number) {
    appLogger.log('App.vue: Fetching products...');
    try {
      const response = await this.apiRoot

        .productProjections()
        .get({
          queryArgs: {
            limit: limit,
            staged: false,
            offset: offset,
          },
        })
        .execute();
      const result = response.body;
      return result;
      appLogger.log('App.vue: Products fetched:', result);
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
