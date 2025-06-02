import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ProductsService, {
  type ProductDetailOptions,
  type ProductIdentifier,
} from '@services/products/productsService';
import type { ProductProjection } from '@commercetools/platform-sdk';
import appLogger from '@/utils/logger';
import { showErrorToast } from '@/utils/toaster';
import i18n from '@/plugins/i18n';
import { AppError } from '@/services/appErrors';
import { AuthMessageKey } from '@/localization/i18nKeys';

interface ProductDetailStateError {
  i18nKey: AuthMessageKey | string;
  i18nParams?: Record<string, unknown>;
  message?: string;
}

export const useProductDetailStore = defineStore('productDetail', () => {
  // --- State ---
  const currentProduct = ref<ProductProjection | null>(null);
  const isLoading = ref(false);
  const error = ref<ProductDetailStateError | null>(null);
  const productNotFound = ref(false);

  // --- Getters ---
  const getProduct = computed(() => currentProduct.value);
  const getIsLoading = computed(() => isLoading.value);
  const getProductNotFound = computed(() => productNotFound.value);
  const getErrorMessage = computed(() => {
    if (productNotFound.value) {
      return i18n.global.t('errors.product.notFound', 'Product not found.');
    }
    if (error.value) {
      return i18n.global.t(error.value.i18nKey, error.value.i18nParams || {});
    }
    return null;
  });

  // --- Actions ---
  function setLoading(loadingState: boolean) {
    isLoading.value = loadingState;
  }

  function setError(err: AppError | Error | string | null) {
    if (!err) {
      error.value = null;
      return;
    }
    let errorPayload: ProductDetailStateError;
    if (err instanceof AppError) {
      errorPayload = {
        i18nKey: err.i18nKey,
        i18nParams: err.i18nParams,
        message: err.message,
      };
    } else if (err instanceof Error) {
      errorPayload = {
        i18nKey: AuthMessageKey.UnknownError,
        i18nParams: { details: err.message },
        message: err.message,
      };
    } else {
      errorPayload = {
        i18nKey: AuthMessageKey.UnknownError,
        message: String(err),
      };
    }
    error.value = errorPayload;
    showErrorToast(
      i18n.global.t(errorPayload.i18nKey, errorPayload.i18nParams || {}),
    );
  }

  function clearError() {
    error.value = null;
    productNotFound.value = false;
  }

  function setProduct(productData: ProductProjection | null) {
    currentProduct.value = productData;
    if (productData === null) {
      productNotFound.value = true;
    }
  }

  async function fetchProduct(
    identifier: ProductIdentifier,
    options?: ProductDetailOptions,
  ) {
    setLoading(true);
    clearError();
    appLogger.log(
      `ProductDetailStore: Fetching product by ${identifier.type}: ${identifier.value}`,
    );
    try {
      let productData: ProductProjection | null = null;
      productData = await ProductsService.fetchProduct(identifier, options);

      setProduct(productData);

      if (productData) {
        appLogger.log(
          'ProductDetailStore: Product fetched successfully:',
          productData,
        );
      } else {
        appLogger.warn(
          `ProductDetailStore: Product with ${identifier.type} '${identifier.value}' not found.`,
        );
      }
    } catch (e: unknown) {
      appLogger.error('ProductDetailStore: Error fetching product', e);
      if (e instanceof AppError) {
        setError(e);
      } else if (e instanceof Error) {
        setError(
          new AppError(AuthMessageKey.UnknownError, {
            details: e.message,
            messageForSuper: e.message,
          }),
        );
      } else {
        setError(
          new AppError(AuthMessageKey.UnknownError, {
            messageForSuper:
              'An unknown error occurred while fetching product.',
          }),
        );
      }
      currentProduct.value = null;
    } finally {
      setLoading(false);
    }
  }

  return {
    currentProduct,
    isLoading,
    error,
    productNotFound,
    getProduct,
    getIsLoading,
    getError: getErrorMessage,
    getProductNotFound,
    fetchProduct,
    clearError,
  };
});
