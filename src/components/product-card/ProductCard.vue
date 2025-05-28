<script setup lang="ts">
import Card from 'primevue/card';
import { Button } from 'primevue';
import { router } from '@/router/router';
import type { ProductProjection } from '@commercetools/platform-sdk';
import { categoriesLanguages } from '@/services/products/productsService';

const props = defineProps<{
  productInfo: ProductProjection;
  language: categoriesLanguages;
}>();

function convertCardInfo(
  productInfo: ProductProjection,
  language: categoriesLanguages,
) {
  const prices = productInfo.masterVariant.prices;

  if (!prices) {
    return;
  }

  const price =
    language === 'ru'
      ? prices[0].value.centAmount / 100 + ' ₽'
      : prices[0].value.centAmount / 10000 + ' €';
  const discounted = productInfo.masterVariant.prices[0].discounted;

  let newPrice;

  if (discounted) {
    newPrice =
      language === 'ru'
        ? discounted.value.centAmount / 100 + ' ₽'
        : discounted.value.centAmount / 10000 + ' €';
  }

  const cardInfo = {
    image: productInfo.masterVariant.images
      ? productInfo.masterVariant.images[0].url
      : '/images/no-image.png',
    name: productInfo.name[language],
    description: productInfo.description
      ? productInfo.description[language]
      : 'No description',
    route: productInfo.slug.en,
    price: price,
    discountedPrice: newPrice ? newPrice : false,
  };

  return cardInfo;
}

function navigate(route: string) {
  router.push(route);
}

const cardInfo = convertCardInfo(props.productInfo, props.language);
</script>

<template>
  <div
    v-if="cardInfo"
    class="relative cursor-pointer hover:scale-102 transition duration-300 easy-in-out"
    @click="navigate(cardInfo.route)"
  >
    <!-- <p
      v-if="!productInfo"
      class="px-5 py-2 bg-(--p-rose-400) text-white font-medium absolute top-5 left-5 rounded-md"
    >
      Out of stock
    </p> -->
    <Card
      class="w-80"
      pt:title:class="min-h-14 flex items-end"
      pt:header:class="min-h-77"
    >
      <template #header>
        <img alt="product image" :src="cardInfo.image" class="p-5 w-full" />
      </template>
      <template #title>
        <h2 class="text-lg font-semibold text-(--p-primary-color)">
          {{ cardInfo.name }}
        </h2>
      </template>
      <template #subtitle>
        <h4 class="truncate text-xs">
          {{ cardInfo.description }}
        </h4>
      </template>
      <template #content>
        <div v-if="cardInfo.discountedPrice" class="flex gap-x-2">
          <p class="text-xl font-bold py-2 line-through opacity-40">
            {{ cardInfo.price }}
          </p>
          <p class="text-xl font-bold py-2 text-(--p-orange-500)">
            {{ cardInfo.discountedPrice }}
          </p>
        </div>
        <p v-else class="text-xl font-bold py-2">
          {{ cardInfo.price }}
        </p>
      </template>
      <template #footer>
        <Button
          v-if="cardInfo"
          label="Add to cart"
          severity="primary"
          outlined
          class="w-full"
          @click.stop="console.log('Add to cart')"
        />
        <Button
          v-else
          label="Add to cart"
          severity="secondary"
          outlined
          class="w-full"
          disabled
        />
      </template>
    </Card>
  </div>
</template>
