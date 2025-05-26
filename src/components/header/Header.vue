<script setup lang="ts">
import { Menubar } from 'primevue';
import { Menu } from 'primevue';
import { Button } from 'primevue';
import { computed, ref } from 'vue';
import InlineSvg from 'vue-inline-svg';
import type { HeaderProps } from './types/header-props';
import { useAuthStore } from '../../stores/authStore';

defineProps<HeaderProps>();

const authStore = useAuthStore();

const userIcon = computed(() => {
  if (authStore.isUserLoggedIn) {
    return 'pi pi-sign-out';
  }

  return 'pi pi-user';
});

const menu = ref();
const toggle = (event: Event) => {
  menu.value.toggle(event);
};
</script>

<template>
  <Menubar :model="navList">
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
      <div class="flex items-center gap-x-2">
        <RouterLink
          to="/profile"
          class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-full"
        >
          <span v-if="authStore.userProfile" class="pi pi-user"></span>
          <span class="truncate max-w-25 md:max-w-50">
            {{ authStore.userProfile?.firstName }}</span
          >
        </RouterLink>
        <Button
          type="button"
          class="ml-0"
          :icon="userIcon"
          aria-haspopup="true"
          aria-controls="overlay_menu"
          size="small"
          variant="outlined"
          @click="toggle"
        />
        <Menu
          id="overlay_menu"
          ref="menu"
          :model="userLoginOptions"
          :popup="true"
        >
          <template #item="{ item, props }">
            <RouterLink
              v-if="item.route"
              :to="item.route"
              v-bind="props.action"
            >
              <span v-if="item.icon" :class="item.icon"></span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </template>
        </Menu>
      </div>
    </template>
  </Menubar>
</template>
