<script setup lang="ts">
import { Menubar } from 'primevue';
import { ref } from 'vue';

const items = ref([
  {
    label: 'Main',
    route: '/',
    icon: 'pi pi-home',
  },
]);
</script>

<template>
  <Menubar :model="items">
    <template #start>
      <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
            <path d="..." fill="var(--p-primary-color)" />
            <path d="..." fill="var(--p-text-color)" />
        </svg>
    </template>
    <template #item="{ item, props, hasSubmenu }">
      <RouterLink v-if="item.route" :to="item.route" v-bind="props.action">
        <span v-if="item.icon" :class="item.icon"></span>
        <span>{{ item.label }}</span>
      </RouterLink>
      <a v-else :href="item.url" :target="item.target" v-bind="props.action">
        <span v-if="item.icon" :class="item.icon"></span>
        <span>{{ item.label }}</span>
        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down"></span>
      </a>
    </template>
  </Menubar>
</template>
