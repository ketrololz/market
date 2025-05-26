<!-- TODO:
      - search
      - pagination
      - filters
      - scroll animation -->

<script setup lang="ts">
import { reactive, ref } from 'vue';
import ProductCard from '../../components/product-card/ProductCard.vue';
import Sidebar from '../../components/sidebar/Sidebar.vue';
import { Breadcrumb } from 'primevue';
import Paginator from 'primevue/paginator';
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
    <div class="flex gap-10 flex-col md:flex-row min-h-150">
      <Sidebar
        class="static top-4 md:sticky"
        @switch-category="handleSwitch"
      ></Sidebar>
      <div class="flex flex-col w-full">
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
        ></Paginator>
      </div>
    </div>
  </div>
</template>
