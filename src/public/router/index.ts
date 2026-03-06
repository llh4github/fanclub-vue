import type { RouteRecordRaw } from 'vue-router'
import FanclubShowcase from '../components/FanclubShowcase.vue'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: FanclubShowcase,
    meta: {
      title: 'fanclub-vup',
    },
  },
]

export default publicRoutes
