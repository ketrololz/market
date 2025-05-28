<script setup lang="ts">
import productsService, {
  categoriesLanguages,
} from '@/services/products/productsService';
import { Select, Panel } from 'primevue';
import { onMounted, ref } from 'vue';

interface CategoryItem {
  name: Name;
  id: string;
  slug: string;
}

type Name = {
  ru: string;
  en: string;
};

const categoryList = ref<CategoryItem[]>([]);

const lang = ref(categoriesLanguages.en);

const emit = defineEmits(['selectCategory']);
const selectedCategory = ref<CategoryItem>(categoryList.value[0]);

// const categoryList = ref<Category[]>()

function handleSelect() {
  emit('selectCategory', selectedCategory.value);
}

//  categories.value = results.map(
//         (categoryObj) => categoryObj.name[language],
//       );

onMounted(async () => {
  const result = await productsService.fetchCategories();
  categoryList.value = result.map((categoryObj) => {
    return {
      name: {
        ru: categoryObj.name.ru,
        en: categoryObj.name.en,
      },
      id: categoryObj.id,
      slug: categoryObj.slug.en,
    };
  });
  categoryList.value.splice(0, 0, {
    name: {
      ru: 'Все категории',
      en: 'All categories',
    },
    id: '0',
    slug: 'all-categories',
  });

  selectedCategory.value = categoryList.value[0];
});
</script>
<template>
  <Panel header="Filters" pt:header:class="text-xl" class="h-full">
    <div class="flex gap-y-2 flex-col">
      <h2 class="text-base font-semibold text-(--p-primary-color)">Category</h2>
      <Select
        v-model="selectedCategory"
        :option-label="lang === 'en' ? 'name.en' : 'name.ru'"
        :options="categoryList"
        class="w-50"
        placeholder="Select category"
        @value-change="handleSelect"
      ></Select>
    </div>
  </Panel>
</template>
