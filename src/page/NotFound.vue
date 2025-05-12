<script setup lang="ts">
  import { Button } from 'primevue';
</script>
<template>
  <div class="flex justify-center flex-col items-center h-dvh gap-y-4">
    <h1 class="text-7xl font-bold text-[var(--p-surface-400)]">404</h1>
    <p class="text-3xl font-bold text-[var(--p-surface-400)]">Sorry, page not found</p>
    <img src="/404img-g.png" class="text-center w-80 mb-6 mt-4">
    <RouterLink to="/">  
      <Button icon="pi pi-home" label="Back Home" variant="outlined"></Button>
    </RouterLink>
  </div>
</template>