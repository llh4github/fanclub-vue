<script setup lang="ts">
import { ref, onMounted, provide } from "vue"
import { useRouter } from "vue-router"
import { NConfigProvider, NMessageProvider, darkTheme } from "naive-ui"
import AdminNavBar from "./AdminNavBar.vue"
import ChangePasswordModal from "./ChangePasswordModal.vue"
import { isLoggedIn, clearAuthData } from "@/utils/auth"
import { setAuthInterceptor } from "@/api/request"

const router = useRouter()
const showPasswordModal = ref(false)
provide("openPasswordModal", () => {
  showPasswordModal.value = true
})

const themeOverrides = {
  common: {
    primaryColor: "#DF7623",
    primaryColorHover: "#FF9E5E",
    primaryColorPressed: "#DF7623",
    borderRadius: "8px",
  },
  Button: {
    colorPrimary: "#DF7623",
    colorHoverPrimary: "#FF9E5E",
    colorPressedPrimary: "#DF7623",
    borderRadiusMedium: "8px",
  },
  Card: {
    borderRadius: "16px",
  },
  Input: {
    borderRadius: "8px",
  },
  DataTable: {
    borderRadius: "12px",
    thColor: "rgba(223, 118, 35, 0.1)",
    tdColor: "transparent",
    thTextColor: "#FF9E5E",
    tdTextColor: "#FFE4CC",
    borderColor: "rgba(223, 118, 35, 0.15)",
  },
}

onMounted(() => {
  if (!isLoggedIn()) {
    router.push("/admin/login")
    return
  }

  setAuthInterceptor(() => {
    clearAuthData()
    router.push("/admin/login")
  }, router)
})
</script>

<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <div class="admin-layout">
        <div class="admin-bg">
          <div
            v-for="i in 20"
            :key="i"
            class="particle"
            :style="{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 10}s`,
            }"
          ></div>
        </div>

        <AdminNavBar @open-password-modal="showPasswordModal = true" />

        <main class="admin-content">
          <RouterView />
        </main>

        <ChangePasswordModal v-model:show="showPasswordModal" />
      </div>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped>
@reference "tailwindcss";

.admin-layout {
  min-height: 100vh;
  min-height: 100svh;
  background: var(--color-dark-bg);
  position: relative;
}

.admin-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(223, 118, 35, 0.15);
  animation: float linear infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  50% {
    transform: translateY(-60px) scale(1.2);
  }
}

.admin-content {
  position: relative;
  z-index: 1;
  padding-top: 1rem;
}
</style>
