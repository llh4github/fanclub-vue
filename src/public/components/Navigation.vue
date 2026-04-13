<template>
  <div>
    <nav
      :class="[
        `fixed top-0 left-0 right-0 z-50 transition-all duration-300`,
        isScrolled ? 'bg-background/95 backdrop-blur-lg border-b border-border' : 'bg-transparent',
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 sm:h-20">
          <router-link to="/" class="flex items-center gap-2 cursor-pointer group">
            <div
              class="w-10 h-10 border-2 border-[#DF7623] flex items-center justify-center clip-corner group-hover:bg-[#DF7623]/10 transition-colors"
            >
              <Carrot class="w-5 h-5 text-[#DF7623] fill-current" />
            </div>
            <span class="font-bold text-lg hidden sm:block text-white">莉蔻的兔子窝</span>
          </router-link>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            <router-link
              v-for="(item, index) in navItems"
              :key="index"
              :to="item.route"
              class="text-sm hover:text-[#DF7623] transition-colors relative group"
            >
              {{ item.label }}
              <span
                class="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#DF7623] group-hover:w-full transition-all duration-300"
              ></span>
            </router-link>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden w-10 h-10 flex items-center justify-center border border-[#DF7623] clip-corner hover:bg-[#DF7623]/10 transition-colors"
          >
            <X v-if="isMobileMenuOpen" class="w-5 h-5 text-[#DF7623]" />
            <Menu v-else class="w-5 h-5 text-[#DF7623]" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <transition name="slide">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-y-0 right-0 z-40 w-full sm:w-80 bg-card border-l border-border md:hidden"
      >
        <div class="flex flex-col h-full pt-24 px-6">
          <router-link
            v-for="(item, index) in navItems"
            :key="index"
            :to="item.route"
            @click="isMobileMenuOpen = false"
            class="py-4 text-left border-b border-border hover:text-[#DF7623] transition-colors"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </transition>

    <!-- Overlay -->
    <transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        @click="isMobileMenuOpen = false"
        class="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
      ></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, X, Carrot } from 'lucide-vue-next'

const router = useRouter()

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navItems = [
  { label: '首页', route: '/' },
  { label: '兔子洞', route: '/admin/login' },
  // { label: '训练纪录', route: '/about' },
  // { label: '歌单', route: '/playlist' },
  { label: '关于本站', route: '/about-site' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.clip-corner {
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}

/* Mobile menu transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Overlay transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Button and router-link styles */
button,
a.router-link-active,
a.router-link-exact-active {
  animation: fadeIn 0.5s ease forwards;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  text-decoration: none;
}

/* Desktop navigation buttons and links */
button.text-sm,
a.text-sm {
  color: var(--foreground);
}

/* Mobile menu button */
button.md\:hidden {
  color: #df7623;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
