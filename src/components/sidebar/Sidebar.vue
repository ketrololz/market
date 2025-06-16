<script setup lang="ts">
import productsService from '@/services/products/productsService';
import {
  CascadeSelect,
  Panel,
  Slider,
  InputNumber,
  Button,
  ToggleSwitch,
  RadioButton,
} from 'primevue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { CategoryItem } from './types/category-item';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

const categoryList = ref<CategoryItem[]>([]);

const userPreferencesStore = useUserPreferencesStore();

const emit = defineEmits([
  'selectCategory',
  'loadCategories',
  'searchProducts',
]);
const selectedCategory = ref<CategoryItem>(categoryList.value[0]);

async function handleSelect() {
  await loadPrices(selectedCategory.value.id);
  emit(
    'selectCategory',
    selectedCategory.value,
    priceRange.value[0],
    priceRange.value[1],
    discountStatus.value,
    selectedPlayers.value,
  );
}

function search() {
  emit(
    'searchProducts',
    selectedCategory.value,
    priceRange.value[0],
    priceRange.value[1],
    discountStatus.value,
    selectedPlayers.value,
  );
}

function clear() {
  selectedPlayers.value = 0;
  discountStatus.value = false;
  priceRange.value[0] = priceMin.value;
  priceRange.value[1] = priceMax.value;
}

async function createCategoryTree() {
  const result = await productsService.fetchCategories();

  const sortedCategories = result.sort((obj) => (obj.parent ? 1 : -1));

  categoryList.value = sortedCategories.reduce(
    (acc: CategoryItem[], categoryObj) => {
      if (!categoryObj.parent) {
        acc.push({
          name: {
            ru: categoryObj.name.ru,
            en: categoryObj.name.en,
          },
          id: categoryObj.id,
          slug: categoryObj.slug.en,
          children: [],
        });
      } else {
        const parent = acc.find(
          (parent) => parent.id === categoryObj.parent?.id,
        );
        if (parent) {
          parent.children.push({
            name: {
              ru: categoryObj.name.ru,
              en: categoryObj.name.en,
            },
            id: categoryObj.id,
            slug: categoryObj.slug.en,
            children: [],
          });
        }
      }
      return acc;
    },
    [],
  );

  categoryList.value.splice(0, 0, {
    name: {
      ru: 'Все категории',
      en: 'All Categories',
    },
    id: '0',
    slug: 'all-categories',
    children: [],
  });

  selectedCategory.value = categoryList.value[0];
}

const route = useRoute();

function handleLoad() {
  const slug = route.params.category;

  function findCategoryBySlug(
    categories: CategoryItem[],
    slug: string | string[],
  ): CategoryItem | null {
    for (const category of categories) {
      if (category.slug === slug) {
        return category;
      }

      if (category.children?.length) {
        const found = findCategoryBySlug(category.children, slug);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  const currentCategoryId = findCategoryBySlug(categoryList.value, slug);

  if (currentCategoryId) {
    selectedCategory.value = currentCategoryId;
  }

  handleSelect();
}

const priceMin = ref(0);
const priceMax = ref(0);
const priceRange = ref([priceMin.value, priceMax.value]);

async function loadPrices(categoryId: string) {
  const prices = await productsService.fetchProductsPrice(categoryId);
  priceMin.value = Math.abs(prices.priceMin) === Infinity ? 0 : prices.priceMin;
  priceMax.value = Math.abs(prices.priceMax) === Infinity ? 0 : prices.priceMax;
  priceRange.value = [priceMin.value, priceMax.value];
}

const discountStatus = ref(false);

const playersCountList = ref([
  { label: 'Any', count: 0, key: 'p-0' },
  { label: '1', count: 1, key: 'p-1' },
  { label: '2', count: 2, key: 'p-2' },
  { label: '3', count: 3, key: 'p-3' },
  { label: '4', count: 4, key: 'p-4' },
  { label: '5', count: 5, key: 'p-5' },
  { label: 'More', count: 6, key: 'p-6' },
]);

const selectedPlayers = ref(0);

onMounted(async () => {
  await createCategoryTree();
  handleLoad();
});
</script>

<template>
  <Panel header="Filters" pt:header:class="text-xl" class="h-full">
    <div class="flex gap-y-6 flex-col">
      <div class="flex gap-y-2 flex-col">
        <h2 class="text-base font-semibold text-(--p-primary-color)">
          Category
        </h2>
        <CascadeSelect
          v-model="selectedCategory"
          :option-label="
            userPreferencesStore.currentLanguage === 'en'
              ? 'name.en'
              : 'name.ru'
          "
          :options="categoryList"
          :option-group-children="['children']"
          :option-group-label="
            userPreferencesStore.currentLanguage === 'en'
              ? 'name.en'
              : 'name.ru'
          "
          class="w-50"
          placeholder="Select category"
          @value-change="handleSelect"
        ></CascadeSelect>
      </div>
      <div class="flex gap-y-2 flex-col">
        <h2 class="text-base font-semibold text-(--p-primary-color)">
          Price, €
        </h2>
        <div class="card flex flex-col justify-center gap-y-3">
          <div class="flex w-50 gap-x-6">
            <InputNumber
              v-model="priceRange[0]"
              :min="priceMin"
              :max="priceMax"
              fluid
            />
            <InputNumber
              v-model="priceRange[1]"
              :min="priceMin"
              :max="priceMax"
              fluid
            />
          </div>
          <Slider
            v-model="priceRange"
            range
            class="w-50"
            :min="priceMin"
            :max="priceMax"
          />
        </div>
      </div>
      <div>
        <h2 class="text-base font-semibold text-(--p-primary-color)">
          Discount
        </h2>
        <div class="flex gap-x-2 w-full justify-between">
          <p>Only with a discount</p>
          <ToggleSwitch v-model="discountStatus" />
        </div>
      </div>
      <div class="flex flex-col gap-y-2">
        <h2 class="text-base font-semibold text-(--p-primary-color)">
          Players
        </h2>
        <div
          v-for="playersCount in playersCountList"
          :key="playersCount.key"
          class="flex items-center gap-2"
        >
          <RadioButton
            v-model="selectedPlayers"
            :input-id="playersCount.key"
            name="dynamic"
            :value="playersCount.count"
          />
          <label :for="playersCount.key">{{ playersCount.label }}</label>
        </div>
      </div>
      <div class="flex gap-x-1">
        <Button label="Search" fluid @click="search"></Button>
        <Button
          icon="pi pi-undo"
          class="min-w-11"
          severity="danger"
          fluid
          :disabled="
            selectedPlayers === 0 &&
            discountStatus === false &&
            priceRange[0] === priceMin &&
            priceRange[1] === priceMax
          "
          @click="clear"
        ></Button>
      </div>
    </div>
  </Panel>
</template>
