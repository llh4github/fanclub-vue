<script setup lang="ts">
import { ref, h } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NDropdown, NIcon, NAvatar, NButton } from "naive-ui"
import {
  HomeOutline,
  LogOutOutline,
  PersonOutline,
  KeyOutline,
  MenuOutline,
  CloseOutline,
} from "@vicons/ionicons5"
import { getUsername, clearAuthData } from "@/utils/auth"
import { logout } from "@/api/auth"

const router = useRouter()
const route = useRoute()
const isDropdownShow = ref(false)
const username = ref(getUsername() || "管理员")

const menuOptions = [
  {
    label: "修改密码",
    key: "change-password",
    icon: () => h(NIcon, null, { default: () => h(KeyOutline) }),
  },
  {
    type: "divider",
    key: "d1",
  },
  {
    label: "退出登录",
    key: "logout",
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }),
  },
]

async function handleSelect(key: string) {
  isDropdownShow.value = false
  if (key === "logout") {
    await performLogout()
  } else if (key === "change-password") {
    emit("openPasswordModal")
  }
}

function goHome() {
  router.push("/")
}

async function handleLogout() {
  await performLogout()
}

async function performLogout() {
  try {
    await logout()
  } catch {}
  clearAuthData()
  router.push("/admin/login")
}

function toggleMobileMenu() {
  const overlay = document.querySelector(".mobile-menu-overlay") as HTMLElement
  if (overlay) {
    overlay.classList.toggle("show")
  }
}

const emit = defineEmits<{
  openPasswordModal: []
}>()

function navigateTo(routeName: string) {
  router.push({ name: routeName })
}
</script>

<template>
  <header class="admin-navbar">
    <div class="navbar-left">
      <button class="nav-btn home-btn" @click="goHome" title="返回首页">
        <NIcon size="20">
          <HomeOutline />
        </NIcon>
        <span class="nav-btn-text">首页</span>
      </button>

      <div class="navbar-divider"></div>

      <nav class="main-nav">
        <button
          class="nav-link"
          :class="{ active: route.name === 'playlist' }"
          @click="navigateTo('playlist')"
        >
          <span class="nav-icon">🎵</span>
          <span class="nav-text">歌单管理</span>
        </button>
        <button
          class="nav-link"
          :class="{ active: route.name === 'treehole' }"
          @click="navigateTo('treehole')"
        >
          <span class="nav-icon">🌳</span>
          <span class="nav-text">树洞管理</span>
        </button>
      </nav>
    </div>

    <div class="navbar-right">
      <NDropdown
        :options="menuOptions"
        @select="handleSelect"
        trigger="click"
        placement="bottom-end"
      >
        <button class="user-menu">
          <NAvatar round size="small" class="user-avatar">
            <NIcon size="16">
              <PersonOutline />
            </NIcon>
          </NAvatar>
          <span class="username">{{ username }}</span>
          <NIcon class="dropdown-arrow">
            <MenuOutline />
          </NIcon>
        </button>
      </NDropdown>
    </div>

    <button class="mobile-menu-btn" @click="toggleMobileMenu">
      <NIcon size="24">
        <MenuOutline />
      </NIcon>
    </button>
  </header>

  <Teleport to="body">
    <Transition name="slide">
      <div class="mobile-menu-overlay" @click="toggleMobileMenu">
        <div class="mobile-menu" @click.stop>
          <div class="mobile-menu-header">
            <span class="mobile-username">{{ username }}</span>
            <NButton quaternary circle size="small" @click="toggleMobileMenu">
              <template #icon>
                <NIcon>
                  <CloseOutline />
                </NIcon>
              </template>
            </NButton>
          </div>
          <div class="mobile-menu-items">
            <button class="mobile-nav-link" @click="goHome">
              <NIcon>
                <HomeOutline />
              </NIcon>
              <span>返回首页</span>
            </button>
            <button class="mobile-nav-link" @click="navigateTo('playlist')">
              <span>🎵</span>
              <span>歌单管理</span>
            </button>
            <button class="mobile-nav-link" @click="navigateTo('treehole')">
              <span>🌳</span>
              <span>树洞管理</span>
            </button>
          </div>
          <div class="mobile-menu-footer">
            <button class="mobile-menu-action" @click="emit('openPasswordModal')">
              <NIcon>
                <KeyOutline />
              </NIcon>
              <span>修改密码</span>
            </button>
            <button class="mobile-menu-action logout" @click="handleLogout">
              <NIcon>
                <LogOutOutline />
              </NIcon>
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.admin-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 1.5rem;
  background: rgba(26, 16, 24, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(223, 118, 35, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(223, 118, 35, 0.2);
  border-radius: 8px;
  color: rgba(255, 228, 204, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.nav-btn:hover {
  background: rgba(223, 118, 35, 0.1);
  border-color: rgba(223, 118, 35, 0.4);
  color: #ffe4cc;
}

.navbar-divider {
  width: 1px;
  height: 32px;
  background: rgba(223, 118, 35, 0.15);
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 228, 204, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  position: relative;
}

.nav-link:hover:not(.disabled) {
  background: rgba(223, 118, 35, 0.1);
  color: #ffe4cc;
}

.nav-link.active {
  background: rgba(223, 118, 35, 0.15);
  color: #ff9e5e;
}

.nav-link.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 1rem;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(223, 118, 35, 0.15);
  border-radius: 24px;
  color: rgba(255, 228, 204, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-menu:hover {
  background: rgba(223, 118, 35, 0.1);
  border-color: rgba(223, 118, 35, 0.3);
}

.user-avatar {
  background: rgba(223, 118, 35, 0.2);
  color: #ff9e5e;
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.mobile-menu-btn {
  display: none;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 228, 204, 0.7);
  cursor: pointer;
}

@media (max-width: 768px) {
  .navbar-left,
  .navbar-right {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }
}

.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  transition: background 0.3s ease;
}

.mobile-menu-overlay.show {
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.mobile-menu {
  width: 280px;
  height: 100%;
  background: rgba(26, 16, 24, 0.98);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.mobile-menu-overlay.show .mobile-menu {
  transform: translateX(0);
}

.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(223, 118, 35, 0.15);
}

.mobile-username {
  font-size: 1rem;
  font-weight: 600;
  color: #ffe4cc;
}

.mobile-menu-items {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 228, 204, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.mobile-nav-link:hover:not(.disabled) {
  background: rgba(223, 118, 35, 0.1);
  color: #ffe4cc;
}

.mobile-nav-link.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mobile-menu-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(223, 118, 35, 0.15);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-menu-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(223, 118, 35, 0.2);
  border-radius: 8px;
  color: rgba(255, 228, 204, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.mobile-menu-action:hover {
  background: rgba(223, 118, 35, 0.1);
  border-color: rgba(223, 118, 35, 0.4);
}

.mobile-menu-action.logout:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}
</style>
