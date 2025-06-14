import { ref } from 'vue';

export const NAV_LINKS = ref([
  {
    label: 'Home',
    route: '/',
    icon: 'pi pi-home',
  },
  {
    label: 'Catalog',
    route: '/catalog/all-categories',
    icon: 'pi pi-th-large',
  },
]);
