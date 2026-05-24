import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from "vue-router"
import { isLoggedIn } from "@/utils/auth"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/pages/HomePage.vue"),
    },
    {
      path: "/contribute",
      name: "contribute",
      component: () => import("@/pages/ContributePage.vue"),
    },
    {
      path: "/admin/login",
      name: "login",
      component: () => import("@/pages/LoginPage.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("@/components/admin/AdminLayout.vue"),
      beforeEnter: (
        _to: RouteLocationNormalized,
        _from: RouteLocationNormalized,
        next: NavigationGuardNext,
      ) => {
        if (isLoggedIn()) {
          next()
        } else {
          next({ name: "login" })
        }
      },
      children: [
        {
          path: "",
          name: "admin-index",
          redirect: { name: "treehole" },
        },
        {
          path: "treehole",
          name: "treehole",
          component: () => import("@/components/admin/TreeholeManagement.vue"),
        },
        {
          path: "treehole/:tab(submission)/:topicId",
          name: "submission",
          component: () => import("@/components/admin/SubmissionManagement.vue"),
          props: true,
        },
        {
          path: "treehole/navigate",
          name: "submissionNavigate",
          component: () => import("@/components/admin/SubmissionNavigate.vue"),
        },
        {
          path: "treehole/navigate/:topicId",
          name: "submissionNavigateWithTopic",
          component: () => import("@/components/admin/SubmissionNavigate.vue"),
          props: true,
        },
        {
          path: "playlist",
          name: "playlist",
          component: () => import("@/components/admin/SonglistManagement.vue"),
        },
      ],
    },
  ],
})

export default router
