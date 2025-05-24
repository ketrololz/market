<script setup lang="ts">
import { Select } from 'primevue';
import { ref } from 'vue';

const categories = ref([
  { name: 'All games', code: 'ALL' },
  { name: 'Party', code: 'PRT' },
  { name: 'Kids', code: 'KDS' },
  { name: 'Adults', code: 'ADL' },
  { name: 'Other', code: 'OTH' },
]);
</script>
<template>
  <aside class="flex gap-y-2 flex-col p-3">
    <h2 class="text-xl font-bold">Category</h2>
    <Select
      :options="categories"
      option-label="name"
      :model-value="categories[0]"
      class="w-50"
    ></Select>
  </aside>
</template>
