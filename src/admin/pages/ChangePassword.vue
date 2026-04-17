<template>
  <div class="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">修改密码</h2>

    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" class="space-y-4">
      <n-form-item label="新密码" path="password">
        <n-input
          v-model:value="form.password"
          type="password"
          placeholder="请输入新密码"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item label="确认新密码" path="confirmPassword">
        <n-input
          v-model:value="form.confirmPassword"
          type="password"
          placeholder="请确认新密码"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" block :loading="isLoading" @click="handleChangePassword">
          确认修改
        </n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts" name="ChangePassword">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import { authService } from '@/api/services/auth'
import { cryptoService } from '@/api/services/crypto'

const router = useRouter()
const message = useMessage()

const form = reactive({
  password: '',
  confirmPassword: '',
})

const rules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 15, message: '密码长度应在 6-15 之间', trigger: 'blur' },
    {
      required: true,
      validator: (rule: any, value: string) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,15}$/.test(value)
      },
      message: '密码必须包含大小写字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      required: true,
      validator: (rule: any, value: string) => {
        return value === form.password
      },
      message: '两次输入的密码不一致',
      trigger: 'blur',
    },
  ],
}

const formRef = ref()
const isLoading = ref(false)

const handleChangePassword = async () => {
  if (formRef.value) {
    await formRef.value.validate()
    isLoading.value = true

    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        throw new Error('用户信息不存在')
      }

      const cryptoCache = localStorage.getItem('cryptoCache')
      if (!cryptoCache) {
        throw new Error('加密会话未初始化，请重新登录')
      }

      const parsedCache = JSON.parse(cryptoCache)
      const cryptoSid = parsedCache.cryptoSid
      const aesKey = await cryptoService.importAesKey(parsedCache.aesKey)

      if (!cryptoSid || !aesKey) {
        throw new Error('加密会话无效，请重新登录')
      }

      const encryptedPassword = await cryptoService.encryptWithAesGcm(form.password, aesKey)

      await authService.updatePassword({
        id: parseInt(userId),
        password: encryptedPassword,
        cryptoSid: cryptoSid,
      })

      message.success('密码修改成功，请重新登录')

      // 清除登录凭证
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('nickname')
      localStorage.removeItem('cryptoCache')

      setTimeout(() => {
        router.push('/admin/login')
      }, 1500)
    } catch (error: any) {
      message.error(error.message || '密码修改失败')
    } finally {
      isLoading.value = false
    }
  }
}
</script>

<style scoped></style>
