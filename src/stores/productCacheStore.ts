import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProductProjection } from '@commercetools/platform-sdk';
import ProductsService from '@/services/products/productsService';

export const useProductCacheStore = defineStore('productCache', () => {
  const productCache = ref(new Map<string, ProductProjection>());

  async function getProductById(
    productId: string,
  ): Promise<ProductProjection | null> {
    if (productCache.value.has(productId)) {
      return productCache.value.get(productId)!;
    }

    try {
      const product = await ProductsService.fetchProduct({
        type: 'id',
        value: productId,
      });

      if (product) {
        productCache.value.set(productId, product);
      }

      return product ?? null;
    } catch (error) {
      console.error('ProductCacheStore: Failed to fetch product', error);
      return null;
    }
  }

  async function getProductDescription(
    productId: string,
    locale = 'ru',
  ): Promise<string> {
    const product = await getProductById(productId);
    return product?.description?.[locale] ?? '';
  }

  function clearCache() {
    productCache.value.clear();
  }

  function getProductDescriptionSync(productId: string, locale = 'ru'): string {
    const product = productCache.value.get(productId);
    return product?.description?.[locale] ?? '';
  }

  return {
    getProductById,
    getProductDescription,
    clearCache,
    getProductDescriptionSync,
  };
});
