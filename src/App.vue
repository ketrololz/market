<script setup lang="ts">
import Footer from './components/footer/Footer.vue';
import Header from './components/header/Header.vue';
import { NAV_LINKS } from './components/header/constants/nav-links.ts';
import { USER_NAV_LINKS } from './components/header/constants/user-login-options.ts';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header :nav-list="NAV_LINKS" :user-login-options="USER_NAV_LINKS"></Header>
    <RouterView class="flex-1"></RouterView>
    <Footer v-if="route.name !== '404'"></Footer>
  </div>
  <!-- Use the following template to add a link to the page:
  <RouterLink to="/link-example">Some text</RouterLink> -->
</template>
