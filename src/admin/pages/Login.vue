<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-md p-8 bg-card rounded-lg border border-border shadow-lg">
      <h1 class="text-2xl font-bold text-center mb-8 text-[#DF7623]">管理员登录</h1>
      <n-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        @submit.prevent="handleLogin"
        class="space-y-6"
      >
        <n-form-item label="用户名" path="username">
          <n-input
            v-model:value="form.username"
            placeholder="请输入用户名"
            :disabled="isLoading"
            :focusable="!isLoading"
          >
            <template #prefix>
              <n-icon>
                <User />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input
            type="password"
            v-model:value="form.password"
            placeholder="请输入密码"
            :disabled="isLoading"
            :focusable="!isLoading"
            show-password
          >
            <template #prefix>
              <n-icon>
                <Lock />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>
        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>
        <n-button
          :loading="isLoading"
          :disabled="isLoading"
          class="w-full"
          :style="{ background: '#DF7623', color: 'white' }"
          @click="handleLogin"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </n-button>
        <div class="text-right mt-4">
          <a @click="goToHome" class="text-white hover:underline cursor-pointer">返回首页</a>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NButton, NForm, NFormItem, NIcon, useMessage } from 'naive-ui'
import { User, Lock } from 'lucide-vue-next'
import { authService } from '../../api/services/auth'

const router = useRouter()
const message = useMessage()

const form = ref({
  username: '',
  password: '',
})

const formRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: ['input', 'blur'],
    },
    {
      min: 3,
      max: 30,
      message: '用户名长度应在 3-30 之间',
      trigger: ['input', 'blur'],
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: ['input', 'blur'],
    },
    {
      min: 6,
      max: 50,
      message: '密码长度应在 6-50 之间',
      trigger: ['input', 'blur'],
    },
  ],
}

const formRef = ref()
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    isLoading.value = true
    error.value = ''

    // 表单验证
    if (formRef.value) {
      await formRef.value.validate()
    }

    // 调用登录接口
    const response = await authService.login(form.value)

    // 登录成功后存储令牌信息
    if (response.data) {
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('userId', response.data.userId.toString())
      localStorage.setItem('username', response.data.uname)
    }

    // 登录成功后跳转到管理员首页
    router.push('/admin')
  } catch (err: any) {
    if (Array.isArray(err) && err.length) {
      // 表单验证错误
      const errorMessage = err[0].message || '请检查输入信息'
      message.error(errorMessage)
      console.log('表单验证错误:', err)
    } else {
      // 登录失败错误
      error.value = err.msg || '登录失败，请检查用户名和密码'
      console.error('登录失败:', err)
    }
  } finally {
    isLoading.value = false
  }
}

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* 调整表单标签颜色为浅色系 */
:deep(.n-form-item-label__text) {
  color: #ece9e9 !important;
}
</style>
