import type { RouteRecordRaw } from 'vue-router'
import Login from '../pages/Login.vue'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'admin-login',
    component: Login,
    meta: {
      title: '管理员登录',
    },
  },
]

export default adminRoutes
