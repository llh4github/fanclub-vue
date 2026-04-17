import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../pages/Login.vue'),
    meta: {
      title: '管理员登录',
    },
  },
  {
    path: '/admin',
    name: 'admin-home',
    component: () => import('../AdminIndex.vue'),
    meta: {
      title: '后台管理',
    },
    children: [
      {
        path: 'change-password',
        name: 'admin-change-password',
        component: () => import('../pages/ChangePassword.vue'),
        meta: {
          title: '修改密码',
        },
      },
    ],
  },
]

export default adminRoutes
