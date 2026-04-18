import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import publicRoutes from '../../public/router'
import adminRoutes from '../../admin/router'

const routes: RouteRecordRaw[] = [...publicRoutes, ...adminRoutes]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'fanclub-vup'

  const accessToken = localStorage.getItem('accessToken')

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!accessToken) {
      next('/admin/login')
      return
    }
  }

  if (to.path === '/admin/login' && accessToken) {
    next('/admin')
    return
  }

  next()
})

export default router
