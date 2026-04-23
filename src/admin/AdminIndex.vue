<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <div class="min-h-screen flex flex-col bg-background text-foreground">
        <header
          class="bg-card text-white py-4 px-6 sm:px-8 shadow-md flex justify-between items-center"
        >
          <h1 class="text-xl sm:text-2xl font-bold">兔子洞管理页面</h1>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-white hover:text-gray-300">主站</router-link>
            <n-dropdown :options="actionOptions" @select="handleAction">
              <n-button text>{{ nickname }}</n-button>
            </n-dropdown>
          </div>
        </header>

        <main class="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <router-view class="h-full" />
        </main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts" name="AdminIndex">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  darkTheme,
  NConfigProvider,
  NMessageProvider,
  NDropdown,
  NButton,
  useMessage,
} from 'naive-ui'
import { authService } from '@/api/services/auth'

const router = useRouter()
const message = useMessage()
const nickname = ref('')

const actionOptions = [
  { label: '修改密码', key: 'changePassword' },
  { label: '退出登录', key: 'logout' },
]

onMounted(() => {
  console.log('后台管理页面已加载')
  nickname.value = localStorage.getItem('nickname') || localStorage.getItem('username') || '管理员'
})

const handleAction = async (key: string) => {
  if (key === 'changePassword') {
    router.push('/admin/change-password')
  } else if (key === 'logout') {
    try {
      await authService.logout()
    } catch {
      // 忽略退出接口错误，继续清除本地数据
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('nickname')
    localStorage.removeItem('cryptoCache')

    message.success('已退出登录')
    router.push('/admin/login')
  }
}
</script>

<style scoped>
/* 自定义样式已通过Tailwind CSS实现 */
</style>
