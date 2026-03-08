import type { RouteRecordRaw } from 'vue-router'
import IndexPage from '../pages/index.vue'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: IndexPage,
    meta: {
      title: 'fanclub-vup',
    },
  },
]

export default publicRoutes
