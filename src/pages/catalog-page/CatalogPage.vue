<script setup lang="ts">
import { reactive } from 'vue';
import ProductCard from '../../components/product-card/ProductCard.vue';

const cardInfo = reactive({
  image: '/images/products/explosive-cats/1.webp',
  title: 'Взрывные котята',
  description:
    '"Взрывные котята" – это карточная игра, дико популярная на "Кикстартере".',
  price: '990 ₽',
  isAvailable: true,
  route: '/',
});
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <ProductCard :card-info="cardInfo" />
  </div>
</template>
