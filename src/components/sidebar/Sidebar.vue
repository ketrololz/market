<script setup lang="ts">
import productsService, {
  categoriesLanguages,
} from '@/services/products/productsService';
import { Select, Panel } from 'primevue';
import { onMounted, ref } from 'vue';

const categories = ref<string[]>([]);

const emit = defineEmits(['selectCategory']);
const selectedCategory = ref(categories.value[0]);

function handleSelect() {
  emit('selectCategory', selectedCategory.value);
}

onMounted(async () => {
  const result = await productsService.fetchCategories(categoriesLanguages.en);
  categories.value = result;
  selectedCategory.value = categories.value[0];
});
</script>
<template>
  <Panel header="Filters" pt:header:class="text-xl" class="h-full">
    <div class="flex gap-y-2 flex-col">
      <h2 class="text-base font-semibold text-(--p-primary-color)">Category</h2>
      <Select
        v-model="selectedCategory"
        :options="categories"
        class="w-50"
        placeholder="Select category"
        @value-change="handleSelect"
      ></Select>
    </div>
  </Panel>
</template>
