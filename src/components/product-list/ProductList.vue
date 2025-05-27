<script setup lang="ts">
import { categoriesLanguages } from '@/services/products/productsService';

import ProductCard from '../product-card/ProductCard.vue';
import type { ProductProjection } from '@commercetools/platform-sdk';

defineProps<{ productList?: ProductProjection[] }>();
// const products = ref<ProductProjection[]>([]);
</script>

<template>
  <div
    class="w-full h-full grid grid-cols-[repeat(auto-fill,_20rem)] gap-6 justify-center"
  >
    <div v-for="product of productList" :key="product.key">
      <ProductCard
        :product-info="product"
        :language="categoriesLanguages.en"
      ></ProductCard>
    </div>
  </div>
</template>
