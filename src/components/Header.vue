<script setup lang="ts">
import { Menubar } from 'primevue';
import { Menu } from 'primevue';
import { Button } from 'primevue';
import { ref } from 'vue';
import InlineSvg from 'vue-inline-svg';

const items = ref([
  {
    label: 'Main',
    route: '/',
    icon: 'pi pi-home',
  },
]);

const userItems = ref([
  {
    label: 'Login',
    route: '/',
    icon: 'pi pi-home',
  },
]);

const menu = ref();
const toggle = (event: Event) => {
  menu.value.toggle(event);
};
</script>

<template>
  <Menubar :model="items">
    <template #start>
      <InlineSvg src="logo-main.svg" height="26" aria-label="logo"> </InlineSvg>
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
    <template #end>
      <Button
        type="button"
        class="ml-0"
        icon="pi pi-user"
        aria-haspopup="true"
        aria-controls="overlay_menu"
        size="small"
        variant="outlined"
        @click="toggle"
      />
      <Menu id="overlay_menu" ref="menu" :model="userItems" :popup="true" />
    </template>
  </Menubar>
</template>
