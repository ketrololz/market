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
  Button,
  type PageState,
} from 'primevue';
import 'primeicons/primeicons.css';
import productsService from '@/services/products/productsService';
import type { Category, ProductProjection } from '@commercetools/platform-sdk';

function handleSelect(category: Category) {
  router.push({
    name: 'CatalogCategory',
    params: { category: normalizeRoute(category.name.en) },
  });
  categoryId.value = category.id;
  page.value = 0;
  getProductsByPage();
}

function normalizeRoute(category: string) {
  return category.split(' ').join('-').toLowerCase();
}

const home = ref({ label: 'Home', route: '/' });

const sortTypes = ref([
  { name: 'Default' },
  { name: 'Name: A-Z' },
  { name: 'Price: low to high' },
  { name: 'Price: high to low' },
]);

const selectedSortType = ref(sortTypes.value[0]);

const searchValue = ref('');

const categoryId = ref<string>('');

const items = ref([{ label: 'All games' }]);

const products = ref<ProductProjection[]>();

const limit = 20;
const page = ref(0);
const totalProducts = ref(0);

async function getProductsByPage() {
  const offset = page.value * limit;
  const result = await productsService.fetchProductsPageByCategory(
    categoryId.value,
    limit,
    offset,
  );

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
      <Sidebar class="top-4" @select-category="handleSelect"></Sidebar>
      <div class="flex flex-col w-full gap-y-10">
        <div class="flex justify-between">
          <Form class="flex gap-2" @submit.prevent>
            <InputText
              v-model="searchValue"
              type="text"
              placeholder="Search..."
            />
            <Button type="submit" severity="secondary" label="Search" />
          </Form>
          <Select
            v-model="selectedSortType"
            :options="sortTypes"
            option-label="name"
            class="w-50"
            placeholder="Select category"
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
