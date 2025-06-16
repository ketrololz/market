<script setup lang="ts">
import ProductCard from '../product-card/ProductCard.vue';
import type { ProductProjection } from '@commercetools/platform-sdk';

defineProps<{ productList?: ProductProjection[]; currentCategory: string }>();
</script>

<template>
  <div
    class="w-full h-full grid grid-cols-[repeat(auto-fill,_20rem)] gap-6 justify-center"
  >
    <div v-for="product of productList" :key="product.key">
      <ProductCard
        :product-info="product"
        :current-category="currentCategory"
      ></ProductCard>
    </div>
  </div>
</template>
