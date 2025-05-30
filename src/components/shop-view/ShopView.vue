<script setup lang="ts">
import Sidebar from '../sidebar/Sidebar.vue';
import ProductList from '../product-list/ProductList.vue';
import { router } from '@/router/router';
import { ref } from 'vue';
import {
  Breadcrumb,
  Select,
  InputText,
  Paginator,
  type PageState,
} from 'primevue';
import 'primeicons/primeicons.css';
import productsService, { currency } from '@/services/products/productsService';
import type { Category, ProductProjection } from '@commercetools/platform-sdk';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

function handleSelect(category: Category, min: number, max: number) {
  router.push({
    name: 'CatalogCategory',
    params: { category: normalizeRoute(category.name.en) },
  });
  categoryId.value = category.id;
  page.value = 0;
  priceMin.value = min;
  priceMax.value = max;
  getProductsByPage();
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

const items = ref([{ label: 'All games' }]);

const products = ref<ProductProjection[]>();

const limit = 20;
const page = ref(0);
const totalProducts = ref(0);

const priceMin = ref(0);
const priceMax = ref(0);

const userPreferencesStore = useUserPreferencesStore();

async function getProductsByPage(text = '') {
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
  });

  products.value = result.results;
  if (result.total) {
    totalProducts.value = result.total;
  }
}

function onPageChange(event: PageState) {
  page.value = event.page;
  getProductsByPage();
}
</script>

<template>
  <div class="px-4 relative">
    <Breadcrumb :home="home" :model="items">
      <template #item="{ item }">
        <RouterLink :to="item.route">
          <span class="text-(--p-breadcrumb-item-color)">{{ item.label }}</span>
        </RouterLink>
      </template>
    </Breadcrumb>
    <div class="flex gap-4 flex-col md:flex-row min-h-150">
      <Sidebar
        class="top-4"
        @select-category="handleSelect"
        @search-products="handleSelect"
      ></Sidebar>
      <div class="flex flex-col w-full gap-y-10">
        <div class="flex justify-between">
          <Form class="flex gap-2" @submit.prevent>
            <InputText
              v-model="searchValue"
              type="text"
              placeholder="Search..."
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
        <ProductList :product-list="products" />
        <Paginator
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
