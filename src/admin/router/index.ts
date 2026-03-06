import type { RouteRecordRaw } from 'vue-router'
import AdminIndex from '../AdminIndex.vue'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'admin-home',
    component: AdminIndex,
    meta: {
      title: '后台管理',
    },
  },
]

export default adminRoutes
