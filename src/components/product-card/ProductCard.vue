<script setup lang="ts">
import Card from 'primevue/card';
import { Button } from 'primevue';
import { reactive } from 'vue';
const cardInfo = reactive({
  image: '/images/products/explosive-cats/1.webp',
  title: 'Взрывные котята',
  description:
    '"Взрывные котята" – это карточная игра, дико популярная на "Кикстартере".',
  price: '990 ₽',
  isAvailable: false,
});
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <div
      class="relative cursor-pointer hover:scale-102 transition duration-300 easy-in-out"
    >
      <p
        v-if="!cardInfo.isAvailable"
        class="px-5 py-2 bg-(--p-rose-400) text-white font-medium absolute top-5 left-5 rounded-md"
      >
        Out of stock
      </p>
      <Card class="w-80">
        <template #header>
          <img alt="product image" :src="cardInfo.image" class="p-5" />
        </template>
        <template #title>
          <h2 class="text-xl font-semibold text-(--p-primary-color)">
            {{ cardInfo.title }}
          </h2>
        </template>
        <template #subtitle>
          <h4 class="truncate text-xs">{{ cardInfo.description }}</h4>
        </template>
        <template #content>
          <p class="text-2xl font-bold py-2">{{ cardInfo.price }}</p>
        </template>
        <template #footer>
          <Button
            label="Add to cart"
            severity="primary"
            outlined
            class="w-full"
          />
        </template>
      </Card>
    </div>
  </div>
</template>
