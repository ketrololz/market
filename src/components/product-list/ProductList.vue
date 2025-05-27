<script setup lang="ts">
import productsService, {
  categoriesLanguages,
} from '@/services/products/productsService';
import { onMounted, ref } from 'vue';
import ProductCard from '../product-card/ProductCard.vue';
import type { ProductProjection } from '@commercetools/platform-sdk';

// defineProps<{ productList: CardInfo }>();
const products = ref<ProductProjection[]>([]);

onMounted(async () => {
  const result = await productsService.fetchProducts();
  console.log(result);
  products.value = result;
});
</script>

<template>
  <div
    class="w-full h-full grid grid-cols-[repeat(auto-fill,_20rem)] gap-6 justify-center"
  >
    <div v-for="product of products" :key="product.key">
      <ProductCard
        :product-info="product"
        :language="categoriesLanguages.en"
      ></ProductCard>
    </div>
  </div>
</template>
