import type { RouteRecordRaw } from 'vue-router'
import IndexPage from '../pages/index.vue'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: IndexPage,
    meta: {
      title: '莉蔻的兔子窝',
    },
  },
]

export default publicRoutes
