<!-- TODO:
      - search
      - pagination
      - filters
      - scroll animation -->

<script setup lang="ts">
import { reactive, ref } from 'vue';
import ProductCard from '../../components/product-card/ProductCard.vue';
import Sidebar from '../../components/sidebar/Sidebar.vue';
import { Breadcrumb, Select, InputText, Paginator, Button } from 'primevue';
import 'primeicons/primeicons.css';

const cardInfo = reactive({
  image: '/images/products/explosive-cats/1.webp',
  title: 'Взрывные котята',
  description:
    '"Взрывные котята" – это карточная игра, дико популярная на "Кикстартере".',
  price: '990 ₽',
  isAvailable: true,
  route: '/',
});

const home = ref({ label: 'Home', route: '/' });

const items = ref([{ label: 'All games' }]);

function handleSwitch(category: { name: string; code: string }) {
  items.value = [{ label: category.name }];
}

const sortTypes = ref([
  { name: 'Default' },
  { name: 'Name: A-Z' },
  { name: 'Price: low to high' },
  { name: 'Price: high to low' },
]);

const selectedSortType = ref(sortTypes.value[0]);

const searchValue = ref('');
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
        @switch-category="handleSwitch"
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
        <div
          class="w-full h-full grid grid-cols-[repeat(auto-fill,_20rem)] gap-6 justify-center"
        >
          <ProductCard :card-info="cardInfo" />
          <ProductCard :card-info="cardInfo" />
          <ProductCard :card-info="cardInfo" />
          <ProductCard :card-info="cardInfo" />
          <ProductCard :card-info="cardInfo" />
          <ProductCard :card-info="cardInfo" />
          <ProductCard :card-info="cardInfo" />
        </div>
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
