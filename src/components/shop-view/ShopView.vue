<script setup lang="ts">
import Sidebar from '../sidebar/Sidebar.vue';
import ProductList from '../product-list/ProductList.vue';
import { router } from '@/router/router';
import { ref } from 'vue';
import { Breadcrumb, Select, InputText, Paginator, Button } from 'primevue';
import 'primeicons/primeicons.css';

// const items = ref([{ label: 'All games' }]);

function handleSelect(category: string) {
  router.push({
    name: 'CatalogCategory',
    params: { category: normalizeRoute(category) },
  });
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

// const cardInfo = reactive({
//   image: '/images/products/explosive-cats/1.webp',
//   title: 'Взрывные котята',
//   description:
//     '"Взрывные котята" – это карточная игра, дико популярная на "Кикстартере".',
//   price: '990 ₽',
//   isAvailable: true,
//   route: '/',
// });

const items = ref([{ label: 'All games' }]);
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
        class="static top-4 md:sticky"
        @select-category="handleSelect"
      ></Sidebar>
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
        <ProductList />
        <Paginator
          :rows="10"
          :total-records="120"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          class="mb-10"
        ></Paginator>
      </div>
    </div>
  </div>
</template>
