<script setup lang="ts">
  import { Menubar } from 'primevue';
  import { ref } from 'vue';

  const items = ref([
    {
      label: 'Main',
      route : '/',
      icon: 'pi pi-home',
    }
  ])
</script>

<template>
  <Menubar :model="items">
    <template #item="{ item, props, hasSubmenu }">
      <RouterLink  v-if="item.route" :to="item.route">
        <span v-if="item.icon" :class="item.icon"></span>
        <span>{{ item.label }}</span>
      </RouterLink>
      <span v-else>{{ item.label }}</span>
    </template>
  </Menubar>
</template>