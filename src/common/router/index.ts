import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import publicRoutes from '../../public/router';
import adminRoutes from '../../admin/router';

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  {
    path: '/admin',
    children: adminRoutes
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'fanclub-vup';
  next();
});

export default router;