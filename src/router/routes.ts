import type { RouteRecordRaw } from 'vue-router'
import NotFound from '../page/NotFound.vue'

// import example
// import VueComponent from '../components/vuecomponent.vue'

export const ROUTES: RouteRecordRaw[] = [
  // Uncomment after adding a component

  // { path: '/', component: Main },
  // { path: '/login', component: Login },
  // { path: '/registration', component: Registration },
  { path: '/:pathMatch(.*)*', component: NotFound },
]
