<script setup lang="ts">
import { Select, Panel } from 'primevue';
import { ref } from 'vue';

const categories = ref([
  { name: 'All games' },
  { name: 'Party' },
  { name: 'Kids' },
  { name: 'Adults' },
  { name: 'Other' },
]);

const selectedCategory = ref(categories.value[0]);

const emit = defineEmits(['switchCategory']);

function handleSwitch() {
  emit('switchCategory', selectedCategory.value);
}
</script>
<template>
  <Panel header="Filters" pt:header:class="text-xl" class="h-full">
    <div class="flex gap-y-2 flex-col">
      <h2 class="text-base font-semibold text-(--p-primary-color)">Category</h2>
      <Select
        v-model="selectedCategory"
        :options="categories"
        option-label="name"
        class="w-50"
        placeholder="Select category"
        @change="handleSwitch"
      ></Select>
    </div>
  </Panel>
</template>
