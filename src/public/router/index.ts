import type { RouteRecordRaw } from 'vue-router'
import IndexPage from '../pages/index.vue'
import AboutSitePage from '../pages/about-site.vue'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: IndexPage,
    meta: {
      title: '莉蔻的兔子窝',
    },
  },
  {
    path: '/about-site',
    name: 'about-site',
    component: AboutSitePage,
    meta: {
      title: '关于本站 - 莉蔻的兔子窝',
    },
  },
]

export default publicRoutes
