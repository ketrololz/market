<script setup lang="ts">
import Footer from './components/footer/Footer.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <RouterView></RouterView>
  <Footer v-if="route.name !== '404'"></Footer>
  <!-- Use the following template to add a link to the page:
  <RouterLink to="/link-example">Some text</RouterLink> -->
</template>
