<script setup lang="ts">
import productsService, {
  categoriesLanguages,
} from '@/services/products/productsService';
import { CascadeSelect, Panel } from 'primevue';
import { onMounted, ref } from 'vue';

interface CategoryItem {
  name: Name;
  id: string;
  slug: string;
  children: CategoryItem[];
}

type Name = {
  ru: string;
  en: string;
};

const categoryList = ref<CategoryItem[]>([]);

const lang = ref(categoriesLanguages.ru);

const emit = defineEmits(['selectCategory']);
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

onMounted(async () => {
  await createCategoryTree();
  handleSelect();
});
</script>
<template>
  <Panel header="Filters" pt:header:class="text-xl" class="h-full">
    <div class="flex gap-y-2 flex-col">
      <h2 class="text-base font-semibold text-(--p-primary-color)">Category</h2>
      <CascadeSelect
        v-model="selectedCategory"
        :option-label="lang === 'en' ? 'name.en' : 'name.ru'"
        :options="categoryList"
        :option-group-children="['children']"
        :option-group-label="lang === 'en' ? 'name.en' : 'name.ru'"
        class="w-50"
        placeholder="Select category"
        @value-change="handleSelect"
      ></CascadeSelect>
    </div>
  </Panel>
</template>
