<script setup lang="ts">
import Footer from './components/footer/Footer.vue';
import Header from './components/header/Header.vue';
import { NAV_LINKS } from './components/header/constants/nav-links.ts';
import { USER_NAV_LINKS } from './components/header/constants/user-login-options.ts';
import { useRoute } from 'vue-router';
import { useProjectSettingsStore } from './stores/projectSettingsStore.ts';

const projectSettingsStore = useProjectSettingsStore();
projectSettingsStore.fetchProjectSettings();

const route = useRoute();
</script>

<template>
  <div class="flex flex-col min-h-screen justify-between">
    <Header :nav-list="NAV_LINKS" :user-login-options="USER_NAV_LINKS"></Header>
    <RouterView></RouterView>
    <Footer v-if="route.name !== '404'"></Footer>
  </div>
</template>
