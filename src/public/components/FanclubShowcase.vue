<template>
  <div class="min-h-screen flex flex-col bg-pink-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
    <nav class="w-full mb-8">
      <div class="flex justify-end items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <router-link to="/admin" class="hover:text-primary transition-colors">后台</router-link>
        <button @click="toggleDarkMode" class="!bg-transparent !border-none p-0 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
          {{ isDarkMode ? '🌞' : '🌙' }}
        </button>
      </div>
    </nav>
    <div class="flex flex-col flex-grow items-center justify-center">
      <header class="mb-12 flex flex-col items-center">
        <div class="relative w-36 h-36 mb-4">
          <div class="absolute inset-0 rounded-full bg-gradient-to-r from-[#DF7623] via-amber-400 to-[#DF7623] animate-spin-slow opacity-70"></div>
          <div class="absolute inset-1 rounded-full bg-white dark:bg-gray-900 overflow-hidden">
            <img :src="randomAvatar" alt="Avatar" class="w-full h-full object-cover" />
          </div>
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold text-primary text-center">{{ config.anchorName }}</h1>
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
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">距离出道纪念日</div>
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
import dayjs from 'dayjs'
import type { FanclubConfig } from '@/types/fanclub'
import avatarA from '@/assets/avatar/avatar_a.webp'
import avatarKu from '@/assets/avatar/avatar_ku.webp'
import avatarXiao from '@/assets/avatar/avatar_xiao.webp'

const config = ref<FanclubConfig>({
  anchorName: '莉蔻Liko',
  debutDate: new Date('2026-01-14'),
  birthday: new Date('2025-08-03')
})
const daysSinceDebut = ref(0)
const daysUntilBirthday = ref(0)
const daysUntilDebutAnniversary = ref(0)
const isDarkMode = ref(false)
const randomAvatar = ref<string>(avatarA as string)

// 更新倒计时
const updateCountdowns = () => {
  const today = dayjs()
  const debutDate = dayjs(config.value.debutDate)
  
  // 计算下一个生日
  const birthday = dayjs(config.value.birthday)
  const birthdayThisYear = dayjs().year(today.year()).month(birthday.month()).date(birthday.date())
  let birthdayDate = birthdayThisYear
  if (today.isAfter(birthdayThisYear)) {
    birthdayDate = birthdayThisYear.add(1, 'year')
  }
  
  // 计算下一个出道纪念日
  const debut = dayjs(config.value.debutDate)
  const debutAnniversaryThisYear = dayjs().year(today.year()).month(debut.month()).date(debut.date())
  let debutAnniversaryDate = debutAnniversaryThisYear
  if (today.isAfter(debutAnniversaryThisYear)) {
    debutAnniversaryDate = debutAnniversaryThisYear.add(1, 'year')
  }
  
  daysSinceDebut.value = today.diff(debutDate, 'day')
  daysUntilBirthday.value = birthdayDate.diff(today, 'day')
  daysUntilDebutAnniversary.value = debutAnniversaryDate.diff(today, 'day')
}

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

  // 随机选择头像
  const avatars = [avatarA, avatarKu, avatarXiao]
  randomAvatar.value = avatars[Math.floor(Math.random() * avatars.length)] as string
  
  // 初始计算倒计时
  updateCountdowns()
  
  console.log(`${config.value.anchorName} showcase page loaded`)
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
button {
  background: transparent !important;
  border: none !important;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
</style>

<style></style>
