import { getAppApiRoot } from '@/api/ctpClient';
import appLogger from '@/utils/logger';
import { parseError } from '../appErrors';

export enum categoriesLanguages {
  ru = 'ru',
  en = 'en',
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

  // async fetchProductsPageByCategory(
  //   categoryId: string,
  //   limit: number,
  //   offset: number,
  // ) {
  //   appLogger.log('App.vue: Fetching products...');
  //   try {
  //     const response = await this.apiRoot
  //       .productProjections()
  //       .get({
  //         queryArgs: {
  //           filter: [`categories.id:"${categoryId}"`],
  //           limit: limit,
  //           staged: false,
  //           offset: offset,
  //         },
  //       })
  //       .execute();
  //     const result = response.body;
  //     return result;
  //     appLogger.log('App.vue: Products fetched:', result);
  //   } catch (error: unknown) {
  //     appLogger.error('App.vue: Error fetching products:', error);
  //     const parsed = parseError(error);
  //     throw new Error(parsed.message);
  //     // errorMessage.value = parsed.message;
  //   }
  // }

  async fetchProductsPageByCategory(
    categoryId: string,
    limit: number,
    offset: number,
  ) {
    appLogger.log('App.vue: Fetching products...');
    try {
      const args =
        categoryId !== '0'
          ? {
              filter: [`categories.id:"${categoryId}"`],
              limit: limit,
              staged: false,
              offset: offset,
            }
          : {
              limit: limit,
              staged: false,
              offset: offset,
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
