<script setup lang="ts">
import { Select } from 'primevue';
import { ref } from 'vue';

const categories = ref([
  { name: 'All games' },
  { name: 'Party' },
  { name: 'Kids' },
  { name: 'Adults' },
  { name: 'Other' },
]);

const selectedCategory = ref();

const emit = defineEmits(['switchCategory']);

function handleSwitch() {
  emit('switchCategory', selectedCategory.value);
}
</script>
<template>
  <aside class="flex gap-y-2 flex-col p-3">
    <h2 class="text-xl font-bold">Category</h2>
    <Select
      v-model="selectedCategory"
      :options="categories"
      option-label="name"
      class="w-50"
      placeholder="Select category"
      @change="handleSwitch"
    ></Select>
  </aside>
</template>
