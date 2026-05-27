<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { getSessionId, initCryptoSession, encryptWithAes } from "@/utils/crypto"
import { getClickCaptcha, verifyClickCaptcha } from "@/api/captcha"
import { login } from "@/api/auth"
import { isSuccess } from "@/api/types"
import { setAuthData } from "@/utils/auth"
import { NInput, NModal, NConfigProvider, darkTheme } from "naive-ui"
import { Click } from "go-captcha-vue"

const router = useRouter()

const isInitializing = ref(true)
const isLoginReady = ref(false)
const isLoggingIn = ref(false)
const initError = ref("")

const formData = ref({
  username: "",
  password: "",
})

const captchaKey = ref("")
const captchaToken = ref("")
const captchaData = ref<{
  image: string
  thumb: string
} | null>(null)

const isCaptchaVerified = ref(false)
const showCaptchaModal = ref(false)
const isCaptchaLoading = ref(false)
const errorMsg = ref("")

onMounted(async () => {
  await initializeCrypto()
})

async function initializeCrypto() {
  isInitializing.value = true
  initError.value = ""

  const success = await initCryptoSession()

  if (success) {
    await loadCaptcha()
    isLoginReady.value = true
  } else {
    initError.value = "加密初始化失败，请刷新重试"
  }

  isInitializing.value = false
}

async function loadCaptcha() {
  isCaptchaLoading.value = true
  try {
    const resp = await getClickCaptcha("login")
    if (isSuccess(resp.code) && resp.data) {
      captchaKey.value = resp.data.captcha_key
      captchaData.value = {
        image: resp.data.master_image,
        thumb: resp.data.thumb_image,
      }
    }
  } catch (error) {
    console.error("Failed to load captcha:", error)
  } finally {
    isCaptchaLoading.value = false
  }
}

async function openCaptchaModal() {
  if (isCaptchaVerified.value) {
    return
  }
  if (!captchaData.value) {
    await loadCaptcha()
  }
  showCaptchaModal.value = true
}

function closeCaptchaModal() {
  showCaptchaModal.value = false
}

const captchaEvents = {
  async confirm(dots: Array<{ x: number; y: number }>, reset: () => void): Promise<boolean> {
    if (!captchaKey.value || dots.length === 0) {
      errorMsg.value = "请先点击图片"
      return false
    }

    const dotsStr = dots.map((d) => `${d.x},${d.y}`).join(";")

    try {
      const verifyResp = await verifyClickCaptcha(captchaKey.value, dotsStr, "login")

      if (isSuccess(verifyResp.code) && verifyResp.data?.success && verifyResp.data.token) {
        errorMsg.value = ""
        captchaToken.value = verifyResp.data.token
        isCaptchaVerified.value = true
        closeCaptchaModal()
        return true
      } else {
        errorMsg.value = "验证失败，请重试"
        reset()
        await loadCaptcha()
        return false
      }
    } catch (error) {
      errorMsg.value = "验证失败，请重试"
      reset()
      await loadCaptcha()
      return false
    }
  },
  async refresh() {
    await loadCaptcha()
  },
  close() {
    errorMsg.value = ""
  },
}

async function handleLogin() {
  errorMsg.value = ""

  if (!formData.value.username || !formData.value.password) {
    errorMsg.value = "请输入用户名和密码"
    return
  }

  isLoggingIn.value = true

  try {
    const sessionId = getSessionId()
    if (!sessionId) {
      errorMsg.value = "会话已过期，请刷新重试"
      isLoggingIn.value = false
      return
    }

    const encryptedPassword = await encryptWithAes(formData.value.password)

    const loginResp = await login({
      username: formData.value.username,
      password: encryptedPassword,
      captcha_token: captchaToken.value,
      session_id: sessionId,
    })

    if (isSuccess(loginResp.code) && loginResp.data) {
      setAuthData({
        id: loginResp.data.id,
        username: loginResp.data.username,
        access_token: loginResp.data.access_token,
        refresh_token: loginResp.data.refresh_token,
        expiration_time: loginResp.data.expiration_time,
      })
      router.push("/admin")
    } else {
      errorMsg.value = loginResp.msg || "登录失败"
      isCaptchaVerified.value = false
      captchaToken.value = ""
      await loadCaptcha()
    }
  } catch (error) {
    errorMsg.value = "网络错误，请检查后端服务"
    isCaptchaVerified.value = false
    captchaToken.value = ""
    console.error("Login error:", error)
  }

  isLoggingIn.value = false
}

function goBack() {
  router.push("/")
}
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <div class="login-page">
      <div class="login-bg">
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
      </div>

      <header class="login-header">
        <button class="back-btn" @click="goBack">
          <span>←</span>
          <span>返回首页</span>
        </button>
      </header>

      <main class="login-main">
        <div class="login-card" :class="{ 'is-ready': !isInitializing }">
          <div v-if="isInitializing" class="init-state">
            <div class="loading-spinner"></div>
            <p class="init-text">🔐 初始化加密通道...</p>
            <p v-if="initError" class="init-error">{{ initError }}</p>
            <button v-if="initError" class="retry-btn" @click="initializeCrypto">重新初始化</button>
          </div>

          <template v-else>
            <div class="login-header-section">
              <div class="login-icon">🔐</div>
              <h1 class="login-title">管理员登录</h1>
              <p class="login-subtitle">Administration Login</p>
            </div>

            <form class="login-form" @submit.prevent="handleLogin">
              <div class="form-group">
                <label class="form-label">用户名</label>
                <NInput v-model:value="formData.username" placeholder="请输入用户名" clearable />
              </div>

              <div class="form-group">
                <label class="form-label">密码</label>
                <NInput
                  v-model:value="formData.password"
                  type="password"
                  show-password-on="click"
                  placeholder="请输入密码"
                >
                </NInput>
              </div>

              <div class="captcha-wrapper">
                <button
                  type="button"
                  class="captcha-btn"
                  :disabled="!formData.username || !formData.password || isCaptchaVerified"
                  @click="openCaptchaModal"
                  :class="{ 'is-verified': isCaptchaVerified }"
                >
                  <span class="captcha-btn-icon">🔐</span>
                  <span class="captcha-btn-text">
                    {{ isCaptchaVerified ? "已验证 ✓" : "点击进行安全验证" }}
                  </span>
                </button>
              </div>

              <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

              <button type="submit" class="login-btn" :disabled="isLoggingIn">
                <span v-if="isLoggingIn" class="btn-spinner"></span>
                <span v-else>登 录</span>
              </button>
            </form>
          </template>
        </div>
      </main>

      <NModal
        v-model:show="showCaptchaModal"
        preset="card"
        :mask-closable="true"
        class="captcha-modal"
        title="验证码"
        :style="{ maxWidth: '420px' }"
        :content-style="{
          background: 'rgba(10, 15, 30, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
        }"
      >
        <template #default>
          <div class="captcha-modal-content">
            <div v-if="isCaptchaLoading" class="captcha-loading">
              <div class="modal-spinner"></div>
              <span>加载验证码中...</span>
            </div>
            <div v-else-if="captchaData" class="captcha-component-wrapper">
              <Click
                :config="{
                  width: 300,
                  height: 220,
                  thumbHeight: 60,
                  title: '请依次点击',
                  buttonText: '验证',
                }"
                :data="{
                  image: captchaData.image,
                  thumb: captchaData.thumb,
                }"
                :events="captchaEvents"
              />
            </div>
            <div v-else class="captcha-error">
              <span>验证码加载失败</span>
              <button class="retry-load-btn" @click="loadCaptcha">重新加载</button>
            </div>
          </div>
        </template>
      </NModal>
    </div>
  </NConfigProvider>
</template>

<style scoped>
@reference "tailwindcss";

:root {
  --login-card-bg: rgba(255, 255, 255, 0.08);
  --login-dark-bg: rgba(15, 20, 40, 0.3);
  --login-dark-input: rgba(0, 0, 0, 0.4);
  --login-accent-15: rgba(139, 92, 246, 0.15);
  --login-accent-30: rgba(139, 92, 246, 0.3);
  --login-accent-50: rgba(139, 92, 246, 0.5);
  --login-text-secondary: rgba(200, 220, 255, 0.6);
  --login-text-muted: rgba(200, 220, 255, 0.3);
  --login-text-40: rgba(200, 220, 255, 0.4);
  --login-form-bg: rgba(255, 255, 255, 0.04);
  --login-danger-bg: rgba(239, 68, 68, 0.15);
  --login-danger-border: rgba(239, 68, 68, 0.3);
  --back-btn-bg: rgba(255, 255, 255, 0.05);
}

.login-page {
  @apply min-h-screen min-h-[100svh] relative overflow-hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1a0a10 50%, #0f172a 100%);
}

.login-bg {
  @apply fixed pointer-events-none;
  inset: 0;
  z-index: 0;
}

.glow-orb {
  @apply absolute rounded-full;
  filter: blur(80px);
  opacity: 0.35;
}

.orb-1 {
  @apply w-[400px] h-[400px];
  background: #E11D48;
  top: -100px;
  right: -100px;
  animation: pulse-orb 4s ease-in-out infinite;
}

.orb-2 {
  @apply w-[300px] h-[300px];
  background: #8B5CF6;
  bottom: -50px;
  left: -50px;
  animation: pulse-orb 5s ease-in-out infinite reverse;
}

@keyframes pulse-orb {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.35;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

.login-header {
  @apply relative px-4 sm:px-6 md:px-8 py-4 sm:py-6;
  z-index: 10;
}

.back-btn {
  @apply flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg cursor-pointer text-sm sm:text-base font-medium transition-all duration-300;
  background: var(--back-btn-bg);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--login-text-secondary);
}

.back-btn:hover {
  @apply text-[#c8dcff];
  background: rgba(139, 92, 246, 0.15);
  border-color: var(--login-accent-30);
}

.login-main {
  @apply relative flex items-center justify-center p-4 sm:p-6 md:px-8;
  z-index: 1;
  min-height: calc(100vh - 100px);
  width: 100%;
}

.login-card {
  @apply w-full rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10;
  @apply backdrop-blur-2xl border;
  max-width: 480px;
  background: var(--login-card-bg);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.login-card.is-ready {
  @apply opacity-100;
  transform: translateY(0);
}

.init-state {
  @apply flex flex-col items-center gap-3 sm:gap-4 py-4 sm:py-6;
}

.loading-spinner {
  @apply w-10 h-10 sm:w-12 sm:h-12 border-[3px] rounded-full;
  border-color: rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.init-text {
  @apply text-sm sm:text-base m-0;
  color: var(--login-text-secondary);
}

.init-error {
  @apply text-sm text-center m-0;
  color: #ef4444;
}

.retry-btn {
  @apply px-4 sm:px-6 py-2 rounded-lg cursor-pointer text-sm transition-all duration-300;
  background: var(--login-accent-15);
  border: 1px solid var(--login-accent-30);
  color: #a78bfa;
}

.retry-btn:hover {
  background: rgba(139, 92, 246, 0.25);
}

.login-header-section {
  @apply text-center mb-4 sm:mb-6 md:mb-8;
}

.login-icon {
  @apply text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3;
  animation: pulse-icon 2s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.login-title {
  @apply text-xl sm:text-2xl md:text-[1.6rem] font-bold m-0 mb-1 md:mb-2;
  background: linear-gradient(135deg, #E11D48 0%, #FB7185 50%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.login-subtitle {
  @apply text-xs sm:text-sm m-0 uppercase;
  color: var(--login-text-40);
  letter-spacing: 4px;
}

.login-form {
  @apply flex flex-col gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-8 rounded-xl md:rounded-2xl;
  background: var(--login-form-bg);
  /* border: 1px solid rgba(255, 255, 255, 0.1); */
  backdrop-filter: blur(16px);
}

.form-group {
  @apply flex flex-col gap-1 sm:gap-2;
}

.form-label {
  @apply text-sm md:text-base font-medium;
  color: #a78bfa;
}

.form-input {
  @apply w-full px-4 py-3 rounded-lg text-base transition-all duration-300;
  background: var(--login-dark-input) !important;
  border-color: #a78bfa !important;
  color: #c8dcff !important;
}

.form-input::placeholder {
  color: var(--login-text-muted);
}

:deep(.n-input) {
  --n-border: 1px solid rgba(139, 92, 246, 0.25) !important;
  --n-border-hover: 1px solid rgba(139, 92, 246, 0.4) !important;
  --n-border-focus: 1px solid #8b5cf6 !important;
  --n-color: rgba(15, 20, 40, 0.6) !important;
  --n-color-focus: rgba(15, 20, 40, 0.8) !important;
  --n-color-focus-error: rgba(15, 20, 40, 0.8) !important;
  --n-color-error: rgba(15, 20, 40, 0.6) !important;
  --n-text-color: #c8dcff !important;
  --n-placeholder-color: rgba(200, 220, 255, 0.3) !important;
  --n-caret-color: #8b5cf6 !important;
  --n-border-radius: 8px;
  --n-height: 48px;
  --n-box-shadow-focus: 0 0 0 3px rgba(139, 92, 246, 0.15) !important;
}

:deep(.n-input .n-input__input-el) {
  color: #c8dcff !important;
  caret-color: #8b5cf6 !important;
}

:deep(.n-input .n-input__placeholder) {
  color: rgba(200, 220, 255, 0.3) !important;
}

:deep(.n-input .n-input__suffix) {
  color: rgba(200, 220, 255, 0.6);
}

.toggle-password {
  @apply text-xl cursor-pointer transition-transform duration-200;
  color: rgba(200, 220, 255, 0.6);
  padding: 4px;
}

.toggle-password:hover {
  transform: scale(1.1);
  color: #a78bfa;
}

.captcha-wrapper {
  @apply flex items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl;
  background: var(--login-dark-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.captcha-btn {
  @apply flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  backdrop-filter: blur(12px);
  color: var(--login-text-secondary);
  font-size: 0.95rem;
  min-width: 200px;
}

.captcha-btn:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  color: #c8dcff;
  transform: translateY(-2px);
}

.captcha-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.captcha-btn.is-verified {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.captcha-btn.is-verified:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.5);
  transform: translateY(-2px);
}

.captcha-btn-icon {
  @apply text-lg;
}

.captcha-btn-text {
  @apply font-medium;
}

.captcha-modal-header {
  @apply text-base font-medium text-[#c8dcff];
}

.captcha-modal-content {
  @apply flex items-center justify-center p-4;
  background: var(--login-dark-bg);
}

.captcha-component-wrapper {
  @apply relative w-full;
  display: flex;
  justify-content: center;
}

.captcha-loading {
  @apply flex flex-col items-center justify-center gap-3 py-12 px-4;
  color: rgba(200, 220, 255, 0.6);
}

.modal-spinner {
  @apply w-10 h-10 border-[3px] rounded-full;
  border-color: rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  animation: spin 1s linear infinite;
}

.captcha-error {
  @apply flex flex-col items-center justify-center gap-3 py-12 px-4;
  color: #f87171;
}

.retry-load-btn {
  @apply px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #a78bfa;
}

.retry-load-btn:hover {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.5);
}

.error-message {
  @apply text-sm sm:text-base text-center m-0 p-2 sm:p-3 rounded-lg;
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}

.login-btn {
  @apply w-full py-2.5 sm:py-3 md:py-[0.9rem] mt-2 sm:mt-3 rounded-xl md:rounded-2xl text-base sm:text-lg font-semibold cursor-pointer transition-all duration-300;
  @apply flex items-center justify-center gap-2;
  background: linear-gradient(135deg, #E11D48 0%, #8B5CF6 50%, #2563EB 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 4px 15px rgba(225, 29, 72, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
}

.login-btn:hover:not(:disabled) {
  @apply -translate-y-0.5 md:-translate-y-1;
  box-shadow:
    0 8px 30px rgba(225, 29, 72, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.login-btn:disabled {
  @apply opacity-70 cursor-not-allowed;
}

.btn-spinner {
  @apply w-4 h-4 sm:w-5 sm:h-5 border-[2px] rounded-full;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}
</style>
