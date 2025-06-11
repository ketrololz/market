<script setup lang="ts">
import { Menubar } from 'primevue';
import { Menu } from 'primevue';
import { Button } from 'primevue';
import { computed, ref } from 'vue';
import InlineSvg from 'vue-inline-svg';
import type { HeaderProps } from './types/header-props';
import { useAuthStore } from '../../stores/authStore';
import OverlayBadge from 'primevue/overlaybadge';
import { useCartStore } from '@/stores/cartStore';

defineProps<HeaderProps>();

const authStore = useAuthStore();
const cartStore = useCartStore();

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

const cartItemCount = computed(() => {
  return (
    cartStore.cart?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) ??
    0
  );
});
</script>

<template>
  <Menubar :model="navList">
    <template #start>
      <RouterLink to="/">
        <InlineSvg src="/logo-main.svg" height="26" aria-label="logo">
        </InlineSvg>
      </RouterLink>
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
      <div class="flex items-center">
        <RouterLink to="/cart">
          <OverlayBadge v-if="cartItemCount > 0" :value="cartItemCount">
            <Button
              icon="pi pi-shopping-cart"
              size="small"
              aria-label="Shopping Cart"
              class="p-button-rounded p-0 !bg-transparent !border-none shadow-none hover:!bg-[#f4f4f5]"
              severity="secondary"
            />
          </OverlayBadge>
          <Button
            v-else
            icon="pi pi-shopping-cart"
            size="small"
            aria-label="Shopping Cart"
            severity="secondary"
            class="p-button-rounded p-0 !bg-transparent !border-none shadow-none hover:!bg-[#f4f4f5]"
        /></RouterLink>
        <RouterLink to="/profile" class="flex items-center gap-2">
          <Button
            v-if="authStore.userProfile"
            type="button"
            class="ml-0 flex items-center gap-2 overflow-hidden min-h-[35px]"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            size="small"
            variant="outlined"
          >
            <span class="pi pi-user"></span>
            <span class="truncate max-w-25 md:max-w-50 username">
              {{ authStore.userProfile.firstName }}
            </span>
          </Button>
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
<style scoped>
@media (max-width: 380px) {
  .username {
    display: none;
  }
}
::v-deep(.p-badge) {
  position: relative !important;
  background: transparent !important;

  color: #4f46e5 !important;
  transform: translate(-15px, -9px) !important;
  outline-style: none !important;
}
</style>
