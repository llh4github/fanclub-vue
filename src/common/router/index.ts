import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import publicRoutes from '../../public/router'
import AdminIndex from '../../admin/AdminIndex.vue'
import Login from '../../admin/pages/Login.vue'

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  {
    path: '/admin/login',
    name: 'admin-login',
    component: Login,
    meta: {
      title: '管理员登录',
    },
  },
  {
    path: '/admin',
    name: 'admin-home',
    component: AdminIndex,
    meta: {
      title: '后台管理',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'fanclub-vup'
  next()
})

export default router
