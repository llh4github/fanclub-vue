<template>
  <div class="min-h-screen flex flex-col bg-pink-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
    <nav class="w-full mb-8">
      <div class="flex justify-end items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <router-link to="/admin" class="hover:text-primary transition-colors">后台</router-link>
        <button @click="toggleDarkMode" class="hover:text-primary transition-colors">
          {{ isDarkMode ? '🌞' : '🌙' }}
        </button>
      </div>
    </nav>
    <div class="flex flex-col flex-grow items-center justify-center">
      <header class="mb-12">
        <h1 class="text-4xl sm:text-5xl font-bold text-primary text-center">{{ anchorName }}</h1>
      </header>

      <main class="w-full max-w-3xl flex flex-col gap-12">
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-md border border-pink-100 dark:border-gray-700"
        >
          <h2
            class="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center"
          >
            纪念日倒计时
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              class="flex flex-col items-center p-4 bg-pink-50 dark:bg-gray-700 rounded-lg border border-pink-100 dark:border-gray-600"
            >
              <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">已出道</div>
              <div class="text-3xl sm:text-4xl font-bold text-primary mb-1">
                {{ daysSinceDebut }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">天</div>
            </div>
            <div
              class="flex flex-col items-center p-4 bg-pink-50 dark:bg-gray-700 rounded-lg border border-pink-100 dark:border-gray-600"
            >
              <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">距离生日</div>
              <div class="text-3xl sm:text-4xl font-bold text-primary mb-1">
                {{ daysUntilBirthday }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">天</div>
            </div>
            <div
              class="flex flex-col items-center p-4 bg-pink-50 dark:bg-gray-700 rounded-lg border border-pink-100 dark:border-gray-600"
            >
              <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">距离出道日</div>
              <div class="text-3xl sm:text-4xl font-bold text-primary mb-1">
                {{ daysUntilDebutAnniversary }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">天</div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap justify-center gap-4 sm:gap-6">
          <div
            class="px-6 py-3 bg-primary text-white rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-primary/90 hover:-translate-y-1 shadow-md"
          >
            歌单
          </div>
          <div
            class="px-6 py-3 bg-primary text-white rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-primary/90 hover:-translate-y-1 shadow-md"
          >
            提问箱
          </div>
          <div
            class="px-6 py-3 bg-primary text-white rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-primary/90 hover:-translate-y-1 shadow-md"
          >
            豆力榜
          </div>
          <div
            class="px-6 py-3 bg-primary text-white rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-primary/90 hover:-translate-y-1 shadow-md"
          >
            两个大凶
          </div>
        </div>
      </main>
    </div>

    <footer class="mt-8 text-gray-500 dark:text-gray-400 text-sm text-center">
      <p>备案号占位</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const anchorName = ref('fanclub-vup')
const daysSinceDebut = ref(599)
const daysUntilBirthday = ref(360)
const daysUntilDebutAnniversary = ref(132)
const isDarkMode = ref(false)

// 初始化夜间模式状态
onMounted(() => {
  // 从localStorage读取状态
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode) {
    isDarkMode.value = JSON.parse(savedDarkMode)
  } else {
    // 检查系统偏好
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // 应用夜间模式
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  // Add actual countdown logic here
  console.log(`${anchorName.value} showcase page loaded`)
})

// 切换夜间模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value

  // 应用夜间模式
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  // 保存状态到localStorage
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
}
</script>

<style scoped>
/* 自定义样式已通过Tailwind CSS实现 */
</style>
