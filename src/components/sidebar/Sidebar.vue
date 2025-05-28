<script setup lang="ts">
import productsService from '@/services/products/productsService';
import { CascadeSelect, Panel } from 'primevue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { CategoryItem } from './types/category-item';
import { useUserPreferencesStore } from '@/stores/userpPreferencesStore';

const categoryList = ref<CategoryItem[]>([]);

const userPreferencesStore = useUserPreferencesStore();

const emit = defineEmits(['selectCategory', 'loadCategories']);
const selectedCategory = ref<CategoryItem>(categoryList.value[0]);

function handleSelect() {
  emit('selectCategory', selectedCategory.value);
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
      en: 'All categories',
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

onMounted(async () => {
  await createCategoryTree();
  handleLoad();
});
</script>

<template>
  <Panel header="Filters" pt:header:class="text-xl" class="h-full">
    <div class="flex gap-y-2 flex-col">
      <h2 class="text-base font-semibold text-(--p-primary-color)">Category</h2>
      <CascadeSelect
        v-model="selectedCategory"
        :option-label="
          userPreferencesStore.currentLanguage === 'en' ? 'name.en' : 'name.ru'
        "
        :options="categoryList"
        :option-group-children="['children']"
        :option-group-label="
          userPreferencesStore.currentLanguage === 'en' ? 'name.en' : 'name.ru'
        "
        class="w-50"
        placeholder="Select category"
        @value-change="handleSelect"
      ></CascadeSelect>
    </div>
  </Panel>
</template>
