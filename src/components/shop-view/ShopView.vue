<script setup lang="ts">
import Sidebar from '../sidebar/Sidebar.vue';
import ProductList from '../product-list/ProductList.vue';
import { router } from '@/router/router';
import { ref } from 'vue';
import { Form } from '@primevue/forms';
import {
  Breadcrumb,
  Select,
  InputText,
  Paginator,
  ProgressSpinner,
  type PageState,
} from 'primevue';
import 'primeicons/primeicons.css';
import productsService, { currency } from '@/services/products/productsService';
import type { Category, ProductProjection } from '@commercetools/platform-sdk';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

function handleSelect(
  category: Category,
  min: number,
  max: number,
  discountStatus: boolean,
  players: number,
) {
  router.push({
    name: 'CatalogCategory',
    params: { category: normalizeRoute(category.name.en) },
  });
  categoryId.value = category.id;
  page.value = 0;
  priceMin.value = min;
  priceMax.value = max;
  isDiscounted.value = discountStatus;
  playersCount.value = players;
  getProductsByPage();
  breadcrumbLink.value = [{ label: category.name.en }];
}

function handleSortSelect() {
  getProductsByPage();
}

function handleSearch(value: string | undefined) {
  getProductsByPage(value);
}

function normalizeRoute(category: string) {
  return category.split(' ').join('-').toLowerCase();
}

const home = ref({ label: 'Home', route: '/' });

const sortTypes = ref([
  { name: 'Default', key: 'createdAt asc' },
  { name: 'Name: A-Z', key: 'name.en asc' },
  { name: 'Name: Z-A', key: 'name.en desc' },
  { name: 'Price: low to high', key: 'price asc' },
  { name: 'Price: high to low', key: 'price desc' },
]);

const selectedSortType = ref(sortTypes.value[0]);

const searchValue = ref('');

const categoryId = ref<string>('');

const breadcrumbLink = ref([{ label: 'All games' }]);

const products = ref<ProductProjection[]>();

const limit = 20;
const page = ref(0);
const totalProducts = ref(0);

const priceMin = ref(0);
const priceMax = ref(0);

const isDiscounted = ref(false);

const playersCount = ref(0);

const userPreferencesStore = useUserPreferencesStore();

async function getProductsByPage(text = '') {
  isLoading.value = true;
  const offset = page.value * limit;

  const lang = userPreferencesStore.currentLanguage;
  const result = await productsService.fetchProductsPageByCategory({
    limit,
    offset,
    categoryId: categoryId.value,
    sort: selectedSortType.value.key,
    language: userPreferencesStore.currentLanguage,
    searchText: text,
    priceMin: priceMin.value,
    priceMax: priceMax.value,
    currency: currency[lang],
    isDiscounted: isDiscounted.value,
    playersCount: playersCount.value,
  });

  products.value = result.results;
  if (result.total) {
    totalProducts.value = result.total;
  }

  isLoading.value = false;
}

const isLoading = ref(true);

function onPageChange(event: PageState) {
  page.value = event.page;
  getProductsByPage();
}
</script>

<template>
  <div class="px-4 relative">
    <Breadcrumb :home="home" :model="breadcrumbLink">
      <template #item="{ item }">
        <RouterLink v-if="item.route" :to="item.route">
          <span class="text-(--p-breadcrumb-item-color)">{{ item.label }}</span>
        </RouterLink>
        <span v-else class="text-(--p-breadcrumb-item-color)">{{
          item.label
        }}</span>
      </template>
    </Breadcrumb>
    <div class="flex gap-4 flex-col md:flex-row min-h-150">
      <Sidebar
        class="mb-4"
        @select-category="handleSelect"
        @search-products="handleSelect"
      ></Sidebar>
      <div class="flex flex-col w-full gap-y-10">
        <div class="flex justify-between gap-x-2">
          <Form class="flex gap-2" @submit.prevent>
            <InputText
              v-model="searchValue"
              type="text"
              placeholder="Search..."
              fluid
              @value-change="handleSearch"
            />
            <!-- <Button type="submit" severity="secondary" label="Search" /> -->
          </Form>
          <Select
            v-model="selectedSortType"
            :options="sortTypes"
            option-label="name"
            class="w-50"
            placeholder="Select category"
            @value-change="handleSortSelect"
          ></Select>
        </div>
        <div
          v-if="isLoading"
          class="w-full h-auto md:h-full flex flex-col items-center justify-center"
        >
          <ProgressSpinner
            fill="transparent"
            animation-duration="4s"
            stroke-width="2.5"
            pt:circle:class="!stroke-(--p-primary-300)"
          />
        </div>
        <ProductList
          v-else-if="products?.length"
          :product-list="products"
          :current-category="categoryId"
        />
        <div
          v-else
          class="w-full h-auto md:h-full flex flex-col items-center justify-center"
        >
          <h1 class="text-7xl font-bold text-[var(--p-surface-400)] pb-4">
            :(
          </h1>
          <p class="text-3xl font-bold text-[var(--p-surface-400)]">
            Sorry, products not found
          </p>
          <img src="/images/no-products.png" class="w-80 mb-6 mt-4" />
        </div>

        <Paginator
          v-if="products?.length"
          :rows="limit"
          :total-records="totalProducts"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          class="mb-10"
          @page="onPageChange"
        ></Paginator>
      </div>
    </div>
  </div>
</template>
