<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import { VGlass } from "@daisigu/vue-liquid-glass"
import ParticleBackground from "@/components/ParticleBackground.vue"
import { getTopicList, addSubmission, type TopicBrief } from "@/api"
import { getClickCaptcha, verifyClickCaptcha } from "@/api/captcha"
import { initCryptoSession } from "@/utils/crypto"
import { isSuccess } from "@/api/types"
import { Liko } from "@/config"
import { NModal, NConfigProvider, NAlert, darkTheme, NSelect, useMessage } from "naive-ui"
import type { SelectOption } from "naive-ui"
import { Click } from "go-captcha-vue"
import MarkdownEditor from "@/components/MarkdownEditor.vue"
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue"
import IconLock from "@/components/icons/IconLock.vue"
import IconCheck from "@/components/icons/IconCheck.vue"
import IconCopy from "@/components/icons/IconCopy.vue"
import IconFile from "@/components/icons/IconFile.vue"
import IconAlert from "@/components/icons/IconAlert.vue"

const router = useRouter()
const route = useRoute()
const message = useMessage()

const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1200)

const isLoading = ref(true)
const isDraftLoaded = ref(false)
const topics = ref<TopicBrief[]>([])
const selectedTopicId = ref<string | null>(null)
const content = ref("")
const isSubmitting = ref(false)
const errorMsg = ref("")
const successMsg = ref("")
const submittedId = ref<string | null>(null)

const captchaKey = ref("")
const captchaToken = ref("")
const captchaData = ref<{
  image: string
  thumb: string
} | null>(null)
const isCaptchaVerified = ref(false)
const showCaptchaModal = ref(false)
const isCaptchaLoading = ref(false)
const captchaError = ref("")

const STORAGE_KEY = "contribute_draft"

const selectedTopic = computed(() => {
  return topics.value.find((t) => t.id === selectedTopicId.value) || null
})

const markdownEditorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null)

const charCount = computed(() => {
  return markdownEditorRef.value?.charCount ?? 0
})

const canVerifyCaptcha = computed(() => {
  return markdownEditorRef.value?.isValid ?? false
})

const isTopicOpen = computed(() => {
  if (!selectedTopic.value) return false
  const now = new Date()
  const openAt = new Date(selectedTopic.value.open_at)
  const closeAt = new Date(selectedTopic.value.close_at)
  return now > openAt && now < closeAt
})

const timeUrgency = computed(() => {
  if (!selectedTopic.value) return "normal"
  const now = new Date()
  const closeAt = new Date(selectedTopic.value.close_at)
  const diffMs = closeAt.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins <= 0) return "expired"
  if (diffMins <= 1) return "critical"
  if (diffMins <= 10) return "urgent"
  if (diffMins <= 60) return "warning"
  return "normal"
})

const timeRemaining = computed(() => {
  if (!selectedTopic.value) return ""
  const now = new Date()
  const closeAt = new Date(selectedTopic.value.close_at)
  const diffMs = closeAt.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins <= 0) return "已截止"
  if (diffMins < 60) return `剩余 ${diffMins} 分钟`
  const hours = Math.floor(diffMins / 60)
  return `剩余 ${hours} 小时`
})

const topicOptions = computed<SelectOption[]>(() => {
  return topics.value.map((topic) => ({
    label: topic.title,
    value: topic.id,
  }))
})

function loadDraft() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const draft = JSON.parse(saved)
      content.value = draft.content || ""
      selectedTopicId.value = draft.topicId || null
      isDraftLoaded.value = true
    }
  } catch (e) {
    console.error("[loadDraft] error:", e)
  }
}

function saveDraft() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        content: content.value,
        topicId: selectedTopicId.value,
        savedAt: new Date().toISOString(),
      }),
    )
  } catch {
    // ignore
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

watch([content, selectedTopicId], () => {
  if (!isDraftLoaded.value) return
  saveDraft()
  updateUrlParam()
})

function updateUrlParam() {
  const query: Record<string, string> = {}
  if (selectedTopicId.value) {
    query.topic_id = String(selectedTopicId.value)
  }
  router.replace({ query })
}

onMounted(async () => {
  await initCryptoSession()
  await loadTopics()
  loadDraft()

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      windowWidth.value = window.innerWidth
    })
  }
})

async function loadTopics() {
  isLoading.value = true
  try {
    const resp = await getTopicList(Liko.BID)
    if (isSuccess(resp.code) && resp.data) {
      topics.value = resp.data

      const urlTopicId = route.query.topic_id
      if (urlTopicId && typeof urlTopicId === "string") {
        const exists = topics.value.some((t) => t.id === urlTopicId)
        if (exists) {
          selectedTopicId.value = urlTopicId
        } else {
          message.warning(`主题 ID ${urlTopicId} 不存在，已切换到默认主题`)
          if (topics.value.length > 0) {
            selectedTopicId.value = topics.value[0].id
          }
        }
      } else if (topics.value.length > 0 && !selectedTopicId.value) {
        selectedTopicId.value = topics.value[0].id
      }
    }
  } catch (error) {
    errorMsg.value = "加载主题失败"
    console.error("Failed to load topics:", error)
  } finally {
    isLoading.value = false
  }
}

async function loadCaptcha() {
  isCaptchaLoading.value = true
  captchaError.value = ""
  try {
    const resp = await getClickCaptcha("submission")
    if (isSuccess(resp.code) && resp.data) {
      captchaKey.value = resp.data.captcha_key
      captchaData.value = {
        image: resp.data.master_image,
        thumb: resp.data.thumb_image,
      }
    }
  } catch (error) {
    captchaError.value = "验证码加载失败"
    console.error("Failed to load captcha:", error)
  } finally {
    isCaptchaLoading.value = false
  }
}

function openCaptchaModal() {
  if (isCaptchaVerified.value) return
  loadCaptcha()
  showCaptchaModal.value = true
}

function closeCaptchaModal() {
  showCaptchaModal.value = false
}

const captchaEvents = {
  async confirm(dots: Array<{ x: number; y: number }>, reset: () => void): Promise<boolean> {
    if (!captchaKey.value || dots.length === 0) {
      captchaError.value = "请先点击图片"
      return false
    }

    const dotsStr = dots.map((d) => `${d.x},${d.y}`).join(";")

    try {
      const verifyResp = await verifyClickCaptcha(captchaKey.value, dotsStr, "submission")

      if (isSuccess(verifyResp.code) && verifyResp.data?.success && verifyResp.data.token) {
        captchaError.value = ""
        captchaToken.value = verifyResp.data.token
        isCaptchaVerified.value = true
        closeCaptchaModal()
        return true
      } else {
        captchaError.value = "验证失败，请重试"
        reset()
        await loadCaptcha()
        return false
      }
    } catch (error) {
      captchaError.value = "验证失败，请重试"
      reset()
      await loadCaptcha()
      return false
    }
  },
  async refresh() {
    await loadCaptcha()
  },
  close() {
    captchaError.value = ""
  },
}

async function handleSubmit() {
  errorMsg.value = ""
  successMsg.value = ""

  if (!selectedTopicId.value) {
    errorMsg.value = "请选择主题"
    return
  }

  if (!content.value.trim()) {
    errorMsg.value = "请填写投稿内容"
    return
  }

  if (!isCaptchaVerified.value) {
    errorMsg.value = "请先完成安全验证"
    return
  }

  isSubmitting.value = true

  try {
    const resp = await addSubmission({
      topic_id: selectedTopicId.value,
      content: content.value,
      captcha_token: captchaToken.value,
    })

    if (isSuccess(resp.code) && resp.data) {
      successMsg.value = "投稿成功！"
      submittedId.value = resp.data.submission_id
      clearDraft()
      content.value = ""
    } else {
      errorMsg.value = resp.msg || "投稿失败"
      isCaptchaVerified.value = false
      captchaToken.value = ""
      await loadCaptcha()
    }
  } catch (error) {
    errorMsg.value = "网络错误，请检查后端服务"
    isCaptchaVerified.value = false
    captchaToken.value = ""
    console.error("Submit error:", error)
  }

  isSubmitting.value = false
}

function goBack() {
  router.push("/")
}

function continueEdit() {
  successMsg.value = ""
  submittedId.value = null
  isCaptchaVerified.value = false
  captchaToken.value = ""
  loadCaptcha()
}

async function copySubmissionId() {
  if (!submittedId.value) return
  try {
    await navigator.clipboard.writeText(submittedId.value)
    message.success("稿件ID已复制到剪贴板")
  } catch {
    message.error("复制失败，请手动复制")
  }
}
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <div class="contribute-page">
      <ParticleBackground />

      <header class="contribute-header">
        <button class="back-btn" @click="goBack" aria-label="返回首页">
          <IconArrowLeft :size="18" />
          <span>返回首页</span>
        </button>
      </header>

      <main class="contribute-main">
        <div class="glass-container">
          <VGlass class="contribute-card" :class="{ 'is-ready': !isLoading }" :blur="15" :scale="40"
            :base-frequency="0.015" :radius="24">
            <div v-if="isLoading" class="init-state">
              <div class="loading-spinner"></div>
              <p class="init-text">加载主题中...</p>
            </div>

            <template v-else>
              <div class="contribute-header-section">
                <div class="contribute-icon">
                  <IconFile :size="48" />
                </div>
                <h1 class="contribute-title">投 稿</h1>
                <p class="contribute-subtitle">Contribute Your Story</p>
              </div>

              <div v-if="successMsg" class="success-state">
                <div class="success-icon">
                  <IconCheck :size="48" />
                </div>
                <p class="success-message">{{ successMsg }}</p>
                <p v-if="submittedId" class="submission-id">稿件ID：{{ submittedId }}</p>
                <button class="copy-btn" @click="copySubmissionId" title="复制稿件ID" aria-label="复制稿件ID">
                  <IconCopy :size="16" />
                </button>
                <div class="success-actions">
                  <button class="continue-btn" @click="continueEdit">继续投稿</button>
                  <button class="back-home-btn" @click="goBack">返回首页</button>
                </div>
              </div>

              <div v-else-if="topics.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">
                  <IconAlert :size="48" />
                </div>
                <h2 class="empty-title">暂无开放投稿</h2>
                <p class="empty-desc">当前没有可用的投稿主题，请稍后再来</p>
                <button class="back-home-btn" @click="goBack">返回首页</button>
              </div>

              <template v-else>
                <div class="topic-section">
                  <label class="form-label">选择主题</label>
                  <NSelect v-model:value="selectedTopicId" :options="topicOptions" placeholder="请选择主题"
                    class="topic-select" />
                  <div v-if="selectedTopic" class="selected-topic-info">
                    <p class="topic-time" :class="`time-${timeUrgency}`">
                      投稿时间：{{ formatDate(selectedTopic.open_at) }} ~
                      {{ formatDate(selectedTopic.close_at) }}
                      <span v-if="isTopicOpen" class="time-remaining">({{ timeRemaining }})</span>
                    </p>
                    <NAlert v-if="selectedTopic.description" title="主播的话" type="info" class="topic-alert">
                      {{ selectedTopic.description }}
                    </NAlert>
                  </div>
                </div>

                <div v-if="selectedTopic && !isTopicOpen" class="time-warning">
                  ⚠️ 当前不在投稿时间内，无法投稿
                </div>

                <div class="content-section" :class="{ disabled: !selectedTopic || !isTopicOpen }">
                  <label class="form-label">投稿内容 (支持 Markdown)</label>
                  <MarkdownEditor ref="markdownEditorRef" v-model="content" :disabled="!selectedTopic || !isTopicOpen"
                    placeholder="请输入投稿内容..." height="600" />
                  <div class="editor-footer">
                    <span class="draft-hint">内容会自动保存到本地</span>
                    <div class="char-counter" :class="{
                      warning: markdownEditorRef?.isNearLimit,
                      error: markdownEditorRef?.isOverLimit,
                      'under-limit': markdownEditorRef?.isUnderLimit,
                    }">
                      <span v-if="markdownEditorRef?.isOverLimit" class="over-limit-icon">⚠️</span>
                      <span v-if="markdownEditorRef?.isUnderLimit" class="under-limit-icon">⚠️</span>
                      <span>{{ charCount }} / {{ markdownEditorRef?.MAX_CHARS }} 字</span>
                      <span v-if="markdownEditorRef?.isOverLimit" class="limit-hint">（已超出限制）</span>
                      <span v-if="markdownEditorRef?.isUnderLimit && !markdownEditorRef?.isOverLimit"
                        class="limit-hint">（至少需要 {{ markdownEditorRef?.MIN_CHARS }} 字）</span>
                    </div>
                  </div>
                </div>
                <div class="captcha-wrapper">
                  <button type="button" class="captcha-btn" :disabled="!canVerifyCaptcha || isCaptchaVerified || !selectedTopic || !isTopicOpen
                    " @click="openCaptchaModal" :class="{ 'is-verified': isCaptchaVerified }">
                    <span class="captcha-btn-icon">
                      <IconLock :size="18" />
                    </span>
                    <span class="captcha-btn-text">
                      {{ isCaptchaVerified ? "已验证" : "点击进行安全验证" }}
                    </span>
                  </button>
                </div>

                <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

                <button type="button" class="submit-btn" :disabled="isSubmitting || !selectedTopic || !isTopicOpen"
                  @click="handleSubmit">
                  <span v-if="isSubmitting" class="btn-spinner"></span>
                  <span v-else>提 交</span>
                </button>
              </template>
            </template>
          </VGlass>
        </div>
      </main>

      <NModal v-model:show="showCaptchaModal" preset="card" :mask-closable="true" class="captcha-modal" title="验证码"
        :style="{ maxWidth: 'min(420px, 95vw)' }" :content-style="{
          background: 'rgba(26, 16, 24, 0.95)',
          border: '1px solid rgba(223, 118, 35, 0.3)',
          borderRadius: '12px',
          padding: '12px',
        }">
        <template #default>
          <div class="captcha-modal-content">
            <div v-if="isCaptchaLoading" class="captcha-loading">
              <div class="modal-spinner"></div>
              <span>加载验证码中...</span>
            </div>
            <div v-else-if="captchaData" class="captcha-component-wrapper">
              <Click :config="{
                width: Math.min(300, windowWidth - 60),
                height: Math.min(220, (Math.min(300, windowWidth - 60) / 300) * 220),
                thumbHeight: Math.min(60, (Math.min(300, windowWidth - 60) / 300) * 60),
                title: '请依次点击',
                buttonText: '验证',
              }" :data="{
                image: captchaData.image,
                thumb: captchaData.thumb,
              }" :events="captchaEvents" />
            </div>
            <div v-else class="captcha-error">
              <span>{{ captchaError || "验证码加载失败" }}</span>
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

.contribute-page {
  @apply min-h-screen min-h-[100svh] bg-[#0d0a0e] relative overflow-hidden;
  background: linear-gradient(135deg, #0d0a0e 0%, #1a1033 50%, #0d0a0e 100%);
}

.contribute-bg {
  @apply fixed pointer-events-none;
  inset: 0;
  z-index: 0;
}

.glow-orb {
  @apply absolute rounded-full;
  filter: blur(80px);
  opacity: 0.3;
}

.orb-1 {
  @apply w-[400px] h-[400px];
  background: #df7623;
  top: -100px;
  left: -100px;
  animation: pulse-orb 4s ease-in-out infinite;
}

.orb-2 {
  @apply w-[300px] h-[300px];
  background: #f5a55c;
  bottom: -50px;
  right: -50px;
  animation: pulse-orb 5s ease-in-out infinite reverse;
}

@keyframes pulse-orb {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
}

.contribute-header {
  @apply relative px-4 sm:px-6 md:px-8 py-4 sm:py-6;
  z-index: 10;
}

.back-btn {
  @apply flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg cursor-pointer text-sm sm:text-base font-medium transition-all duration-300;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  min-height: 44px;
  touch-action: manipulation;
}

.back-btn:hover {
  @apply text-white;
  background: rgba(223, 118, 35, 0.15);
  border-color: rgba(223, 118, 35, 0.3);
}

.contribute-main {
  @apply relative flex items-center justify-center p-4 sm:p-6 md:px-8;
  z-index: 1;
  min-height: calc(100vh - 100px);
  width: 100%;
}

.glass-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.contribute-card {
  @apply w-full rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10;
  max-width: 100%;
  @apply md:max-w-3xl lg:max-w-5xl;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (max-width: 640px) {
  .contribute-card {
    @apply rounded-xl;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
}

.contribute-card.is-ready {
  @apply opacity-100;
  transform: translateY(0);
}

.init-state {
  @apply flex flex-col items-center gap-3 sm:gap-4 py-4 sm:py-6;
}

.loading-spinner {
  @apply w-10 h-10 sm:w-12 sm:h-12 border-[3px] rounded-full;
  border-color: rgba(102, 126, 234, 0.2);
  border-top-color: rgba(167, 139, 250, 0.8);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.init-text {
  @apply text-sm sm:text-base m-0;
  color: rgba(255, 255, 255, 0.5);
}

.contribute-header-section {
  @apply text-center mb-4 sm:mb-6 md:mb-8;
}

.contribute-icon {
  @apply flex items-center justify-center text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3;
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

.contribute-title {
  @apply text-xl sm:text-2xl md:text-[1.6rem] font-bold m-0 mb-1 md:mb-2;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(167, 139, 250, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4px;
}

.contribute-subtitle {
  @apply text-xs sm:text-sm m-0 uppercase;
  color: rgba(167, 139, 250, 0.4);
  letter-spacing: 4px;
}

.topic-section {
  @apply flex flex-col gap-2 mb-4;
}

.topic-select {
  @apply w-full;
}

:deep(.n-base-selection) {
  --n-border: 1px solid rgba(102, 126, 234, 0.25) !important;
  --n-border-hover: 1px solid rgba(102, 126, 234, 0.4) !important;
  --n-border-focus: 1px solid rgba(167, 139, 250, 0.8) !important;
  --n-color: rgba(255, 255, 255, 0.05) !important;
  --n-text-color: rgba(255, 255, 255, 0.85) !important;
  --n-placeholder-color: rgba(167, 139, 250, 0.4) !important;
  --n-caret-color: rgba(167, 139, 250, 0.8) !important;
  --n-border-radius: 8px;
  --n-height: 48px;
  min-height: 48px;
}

@media (max-width: 640px) {
  :deep(.n-base-selection) {
    --n-height: 52px;
    min-height: 52px;
  }
}

:deep(.n-base-selection .n-base-selection-label) {
  background: rgba(26, 16, 24, 0.5) !important;
}

:deep(.n-base-selection .n-base-selection-placeholder) {
  color: rgba(223, 118, 35, 0.4) !important;
}

.selected-topic-info {
  @apply mt-2;
}

.topic-time {
  @apply text-sm font-medium m-0 mb-2;
  color: rgba(255, 228, 204, 0.85);
}

.time-warning {
  @apply text-sm font-medium m-0 mb-2;
  color: #fbbf24;
}

.time-urgent {
  @apply text-sm font-medium m-0 mb-2;
  color: #f97316;
}

.time-critical {
  @apply text-sm font-bold m-0 mb-2;
  color: #ef4444;
  animation: pulse-critical 1s infinite;
}

.time-expired {
  @apply text-sm font-medium m-0 mb-2;
  color: rgba(255, 228, 204, 0.4);
  text-decoration: line-through;
}

.time-remaining {
  @apply font-normal ml-1;
  opacity: 0.8;
}

@keyframes pulse-critical {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

.topic-alert {
  @apply text-sm m-0;
  max-height: 80px;
  overflow: hidden;
  word-break: break-word;
}

@media (max-width: 640px) {
  .topic-alert {
    @apply text-xs;
    max-height: 60px;
  }
}

.time-warning {
  @apply text-center text-sm p-3 mb-4 rounded-lg;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.content-section {
  @apply flex flex-col gap-2 mb-4 relative;
}

.content-section.disabled {
  @apply opacity-50;
  pointer-events: none;
}

.form-label {
  @apply text-sm md:text-base font-medium;
  color: rgba(167, 139, 250, 0.9);
}

.draft-hint {
  @apply text-xs m-0;
  color: rgba(255, 228, 204, 0.3);
}

.editor-footer {
  @apply flex justify-between items-center mt-1;
}

.char-counter {
  @apply flex items-center gap-1 text-sm;
  color: rgba(255, 228, 204, 1);
}

.char-counter.warning {
  color: #fbbf24;
}

.char-counter.error {
  color: #f87171;
}

.char-counter.under-limit {
  color: #fbbf24;
}

.limit-hint {
  @apply text-xs;
  color: #f87171;
}

.content-input {
  @apply w-full;
}

:deep(.n-input) {
  --n-border: 1px solid rgba(223, 118, 35, 0.25) !important;
  --n-border-hover: 1px solid rgba(223, 118, 35, 0.4) !important;
  --n-border-focus: 1px solid rgba(223, 118, 35, 0.8) !important;
  --n-color: rgba(255, 255, 255, 0.05) !important;
  --n-color-focus: rgba(255, 255, 255, 0.05) !important;
  --n-color-focus-error: rgba(255, 255, 255, 0.05) !important;
  --n-color-error: rgba(255, 255, 255, 0.05) !important;
  --n-text-color: rgba(255, 255, 255, 0.85) !important;
  --n-placeholder-color: rgba(223, 118, 35, 0.4) !important;
  --n-caret-color: rgba(223, 118, 35, 0.8) !important;
  --n-border-radius: 8px;
}

:deep(.n-input .n-input__input-el) {
  color: rgba(255, 255, 255, 0.85) !important;
  caret-color: rgba(223, 118, 35, 0.8) !important;
}

.captcha-wrapper {
  @apply flex items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl mb-4;
}

.captcha-btn {
  @apply flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-lg cursor-pointer transition-all duration-300;
  background: rgba(223, 118, 35, 0.15);
  border: 1px solid rgba(223, 118, 35, 0.3);
  color: rgba(223, 118, 35, 0.9);
  font-size: 0.95rem;
  min-width: 200px;
  min-height: 52px;
  touch-action: manipulation;
}

@media (max-width: 640px) {
  .captcha-btn {
    @apply w-full;
    min-width: unset;
  }
}

.captcha-btn:hover:not(:disabled) {
  background: rgba(223, 118, 35, 0.25);
  border-color: rgba(223, 118, 35, 0.5);
  color: rgba(223, 118, 35, 1);
  transform: translateY(-2px);
}

.captcha-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.captcha-btn.is-verified {
  background: rgba(223, 118, 35, 0.15);
  border-color: rgba(223, 118, 35, 0.4);
  color: rgba(223, 118, 35, 0.9);
}

.captcha-btn.is-verified:hover {
  background: rgba(223, 118, 35, 0.25);
  border-color: rgba(223, 118, 35, 0.5);
  transform: translateY(-2px);
}

.captcha-btn-icon {
  @apply text-lg;
}

.captcha-btn-text {
  @apply font-medium;
}

.captcha-modal-content {
  @apply flex items-center justify-center p-3 sm:p-4;
}

.captcha-component-wrapper {
  @apply relative w-full;
  display: flex;
  justify-content: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 640px) {
  .captcha-modal-content {
    @apply p-2;
  }

  .captcha-component-wrapper {
    @apply justify-center;
  }
}

.captcha-loading {
  @apply flex flex-col items-center justify-center gap-3 py-8 sm:py-12 px-3 sm:px-4;
  color: rgba(255, 228, 204, 0.6);
}

.modal-spinner {
  @apply w-10 h-10 border-[3px] rounded-full;
  border-color: rgba(223, 118, 35, 0.2);
  border-top-color: #df7623;
  animation: spin 1s linear infinite;
}

.captcha-error {
  @apply flex flex-col items-center justify-center gap-3 py-8 sm:py-12 px-3 sm:px-4;
  color: #f87171;
  text-align: center;
}

.retry-load-btn {
  @apply px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200;
  background: rgba(223, 118, 35, 0.15);
  border: 1px solid rgba(223, 118, 35, 0.3);
  color: #ff9e5e;
}

.retry-load-btn:hover {
  background: rgba(223, 118, 35, 0.25);
  border-color: rgba(223, 118, 35, 0.5);
}

.error-message {
  @apply text-sm sm:text-base text-center m-0 p-2 sm:p-3 rounded-lg mb-4;
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}

.success-state {
  @apply flex flex-col items-center gap-4 py-8;
}

.success-icon {
  @apply text-5xl;
}

.success-message {
  @apply text-xl font-semibold m-0;
  color: #4ade80;
}

.submission-id {
  @apply text-base m-0;
  color: rgba(255, 228, 204, 0.7);
}

.copy-btn {
  @apply ml-2 px-2 py-1 rounded-lg cursor-pointer text-sm transition-all duration-200;
  background: rgba(223, 118, 35, 0.15);
  border: 1px solid rgba(223, 118, 35, 0.3);
  color: rgba(255, 228, 204, 0.6);
}

.copy-btn:hover {
  background: rgba(223, 118, 35, 0.25);
  border-color: rgba(223, 118, 35, 0.5);
  color: #ff9e5e;
}

.success-actions {
  @apply flex gap-4 mt-4;
}

.continue-btn,
.back-home-btn {
  @apply px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl text-base font-medium cursor-pointer transition-all duration-300;
  min-height: 52px;
  touch-action: manipulation;
}

@media (max-width: 640px) {

  .continue-btn,
  .back-home-btn {
    @apply flex-1;
    min-width: calc(50% - 8px);
  }

  .success-actions {
    @apply flex-col gap-3;
  }
}

.continue-btn {
  background: rgba(223, 118, 35, 0.15);
  border: 1px solid rgba(223, 118, 35, 0.3);
  color: rgba(223, 118, 35, 0.9);
}

.continue-btn:hover {
  background: rgba(223, 118, 35, 0.25);
  border-color: rgba(223, 118, 35, 0.5);
}

.back-home-btn {
  background: linear-gradient(135deg, rgba(223, 118, 35, 0.6) 0%, rgba(245, 165, 92, 0.5) 100%);
  border: none;
  color: white;
}

.back-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(223, 118, 35, 0.4);
}

.empty-state {
  @apply flex flex-col items-center gap-4 py-8 sm:py-12;
}

.empty-icon {
  @apply text-5xl sm:text-6xl;
}

.empty-title {
  @apply text-xl sm:text-2xl font-semibold m-0;
  color: rgba(255, 228, 204, 0.9);
}

.empty-desc {
  @apply text-sm sm:text-base m-0 text-center;
  color: rgba(255, 228, 204, 0.5);
}

.submit-btn {
  @apply w-full py-3 sm:py-3.5 md:py-[0.9rem] rounded-xl md:rounded-2xl text-base sm:text-lg font-semibold cursor-pointer transition-all duration-300;
  @apply flex items-center justify-center gap-2;
  background: linear-gradient(135deg, rgba(223, 118, 35, 0.6) 0%, rgba(245, 165, 92, 0.5) 100%);
  color: white;
  border: none;
  min-height: 52px;
  touch-action: manipulation;
}

.submit-btn:hover:not(:disabled) {
  @apply -translate-y-0.5 md:-translate-y-1;
  box-shadow: 0 8px 24px rgba(223, 118, 35, 0.4);
}

.submit-btn:disabled {
  @apply opacity-70 cursor-not-allowed;
}

.btn-spinner {
  @apply w-4 h-4 sm:w-5 sm:h-5 border-[2px] rounded-full;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}
</style>
