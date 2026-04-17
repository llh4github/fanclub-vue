<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-md p-8 bg-card rounded-lg border border-border shadow-lg">
      <h1 class="text-2xl font-bold text-center mb-8 text-[#DF7623]">管理员登录</h1>
      <n-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-placement="top"
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
            v-model:value="form.password"
            type="password"
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
        <n-form-item label="验证码" path="captcha">
          <div class="flex space-x-2 items-center">
            <n-input-otp
              v-model:value="otpValue"
              :length="captchaLength"
              :disabled="isLoading"
              class="flex-1"
            />
            <div class="flex-shrink-0">
              <img
                :src="captchaImage"
                alt="验证码"
                class="h-10 w-32 object-contain cursor-pointer"
                @click="fetchCaptcha"
                :disabled="isLoading"
              />
            </div>
          </div>
        </n-form-item>
        <!-- 错误提示将使用 message 组件显示 -->
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, useMessage, NIcon, NInputOtp } from 'naive-ui'
import { User, Lock } from 'lucide-vue-next'
import { authService } from '@/api/services/auth'
import { cryptoService } from '@/api/services/crypto'

const router = useRouter()
const message = useMessage()
const formRef = ref()

const isLoading = ref(false)
const captchaImage = ref('')
const captchaLength = ref(4)
const aesKey = ref<CryptoKey | null>(null)
const sessionId = ref('')

const form = reactive({
  username: '',
  password: '',
  captcha: '',
  captchaKey: '',
})

// 验证码输入框的计算属性
const otpValue = computed({
  get: () => form.captcha.split(''),
  set: (value: string[]) => {
    form.captcha = value.join('')
  },
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度应在 3-30 之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 15, message: '密码长度应在 6-15 之间', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度应在 4-6 之间', trigger: 'blur' },
  ],
}

// 初始化
onMounted(async () => {
  // 获取验证码
  await fetchCaptcha()
  // 初始化密钥交换
  await initKeyExchange()
})

// 获取验证码
const fetchCaptcha = async () => {
  try {
    const response = await cryptoService.generateCaptcha()
    if (response.data) {
      form.captchaKey = response.data.key
      captchaImage.value = response.data.images
      // 清空验证码输入框
      form.captcha = ''
      // 更新验证码长度
      if (response.data.len) {
        captchaLength.value = response.data.len
      }
    }
  } catch (err) {
    console.error('获取验证码失败:', err)
    message.error('获取验证码失败，请重试')
  }
}

// 初始化密钥交换
const initKeyExchange = async () => {
  try {
    // 检查缓存
    const cachedData = localStorage.getItem('cryptoCache')
    const now = Date.now()

    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData)
        if (parsedCache.expiry && now < parsedCache.expiry) {
          // 使用缓存数据
          sessionId.value = parsedCache.cryptoSid
          // 导入 AES 密钥
          aesKey.value = await cryptoService.importAesKey(parsedCache.aesKey)
          return
        }
      } catch (e) {
        // 缓存解析失败，清除缓存
        localStorage.removeItem('cryptoCache')
      }
    }

    const response = await cryptoService.initKeyExchange()
    if (response.data) {
      // 使用后端返回的 cryptoSid
      const cryptoSid = response.data.cryptoSid
      // 生成AES密钥
      const generatedAesKey = await cryptoService.generateAesKey()
      // 用RSA公钥加密AES密钥
      const encryptedAesKey = await cryptoService.encryptAesKeyWithRsa(
        generatedAesKey,
        response.data.publicKey,
      )
      // 完成密钥交换
      await cryptoService.completeKeyExchange({
        cryptoSid: cryptoSid,
        encryptedAesKey: encryptedAesKey,
      })

      // 导出 AES 密钥为字符串
      const aesKeyStr = await cryptoService.exportAesKey(generatedAesKey)

      // 存储到本地存储，有效期24小时
      const expiry = now + 24 * 60 * 60 * 1000
      localStorage.setItem(
        'cryptoCache',
        JSON.stringify({
          cryptoSid: cryptoSid,
          aesKey: aesKeyStr,
          expiry: expiry,
        }),
      )

      // 更新本地变量
      sessionId.value = cryptoSid
      aesKey.value = generatedAesKey
    }
  } catch (err) {
    console.error('密钥交换失败:', err)
    message.error('密钥交换失败，请刷新页面重试')
  }
}

const handleLogin = async () => {
  try {
    isLoading.value = true

    // 表单验证
    if (formRef.value) {
      await formRef.value.validate()
    }

    // 加密密码
    if (!aesKey.value) {
      throw new Error('AES 密钥未初始化')
    }
    const encryptedPassword = await cryptoService.encryptWithAesGcm(form.password, aesKey.value)

    // 调用登录接口
    const response = await authService.login({
      username: form.username,
      password: encryptedPassword,
      captcha: form.captcha,
      captchaKey: form.captchaKey,
      cryptoSid: sessionId.value,
    })

    // 登录成功后存储令牌信息
    if (response.data) {
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('userId', response.data.userId.toString())
      localStorage.setItem('username', response.data.uname)
      localStorage.setItem('nickname', response.data.nickname || response.data.uname)
    }

    // 登录成功后跳转到管理员首页
    router.push('/admin')
  } catch (err: any) {
    if (Array.isArray(err) && err.length) {
      // 表单验证错误
      const errorMessage = err[0].message || '请检查输入信息'
      message.error(errorMessage)
      console.log('表单验证错误:', err)
    } else if (err.code === 'CRYPTO_KEY_ERROR') {
      // 密钥错误，需要重新获取加密 key
      localStorage.removeItem('cryptoCache')
      await initKeyExchange()
      message.warning('密钥已更新，请重新点击登录')
    } else {
      // 登录失败错误
      const errorMessage = err.msg || '登录失败，请检查用户名和密码'
      message.error(errorMessage)
      console.error('登录失败:', err)
      // 刷新验证码
      await fetchCaptcha()
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
:deep(.n-form-item-label__text) {
  color: #666 !important;
}
</style>
