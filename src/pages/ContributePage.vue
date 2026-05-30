<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
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

      <!-- Geometric decorations -->
      <div class="geo-deco deco-hex"></div>
      <div class="geo-deco deco-triangle"></div>

      <header class="contribute-header">
        <button class="back-btn" @click="goBack" aria-label="返回首页">
          <IconArrowLeft :size="18" />
          <span>返回</span>
        </button>
      </header>

      <main class="contribute-main">
        <div class="contribute-container">
          <!-- Header section -->
          <div class="contribute-header-section">
            <div class="header-icon">
              <IconFile :size="48" />
            </div>
            <h1 class="contribute-title">
              <span class="title-main">投</span>
              <span class="title-main">稿</span>
            </h1>
            <p class="contribute-subtitle">CONTRIBUTE YOUR STORY</p>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="init-state">
            <div class="loading-spinner"></div>
            <p class="init-text">加载主题中...</p>
          </div>

          <!-- Success state -->
          <div v-else-if="successMsg" class="success-state">
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

          <!-- Empty state -->
          <div v-else-if="topics.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">
              <IconAlert :size="48" />
            </div>
            <h2 class="empty-title">暂无开放投稿</h2>
            <p class="empty-desc">当前没有可用的投稿主题，请稍后再来</p>
            <button class="back-home-btn" @click="goBack">返回首页</button>
          </div>

          <!-- Form -->
          <template v-else>
            <div class="form-section topic-section">
              <label class="form-label">选择主题</label>
              <NSelect v-model:value="selectedTopicId" :options="topicOptions" placeholder="请选择主题"
                class="topic-select" />
              <div v-if="selectedTopic" class="selected-topic-info">
                <p class="topic-time" :class="`time-${timeUrgency}`">
                  投稿时间：{{ formatDate(selectedTopic.open_at) }} ~ {{ formatDate(selectedTopic.close_at) }}
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

            <div class="form-section content-section" :class="{ disabled: !selectedTopic || !isTopicOpen }">
              <label class="form-label">投稿内容 (支持 Markdown)</label>
              <MarkdownEditor ref="markdownEditorRef" v-model="content" :disabled="!selectedTopic || !isTopicOpen"
                placeholder="请输入投稿内容..." height="600" :topic-id="selectedTopicId || ''" />
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

            <!-- Captcha section -->
            <div class="captcha-wrapper">
              <button type="button" class="captcha-btn"
                :disabled="!canVerifyCaptcha || isCaptchaVerified || !selectedTopic || !isTopicOpen"
                @click="openCaptchaModal" :class="{ 'is-verified': isCaptchaVerified }">
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
        </div>
      </main>

      <NModal v-model:show="showCaptchaModal" preset="card" :mask-closable="true" class="captcha-modal" title="验证码"
        :style="{ maxWidth: 'min(420px, 95vw)' }" :content-style="{
          background: 'rgba(10, 8, 18, 0.95)',
          border: '1px solid rgba(0, 245, 255, 0.3)',
          borderRadius: '0',
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
.contribute-page {
  min-height: 100vh;
  min-height: 100svh;
  background: linear-gradient(180deg, #050510 0%, #0a0812 50%, #1a0a2e 100%);
  position: relative;
  overflow: hidden;
}

/* Geometric decorations */
.geo-deco {
  position: fixed;
  pointer-events: none;
  z-index: 0;
}

.deco-hex {
  top: 10%;
  right: 5%;
  width: 120px;
  height: 138px;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.08), rgba(139, 92, 246, 0.05));
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  animation: float 10s ease-in-out infinite;
}

.deco-triangle {
  bottom: 15%;
  left: 5%;
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 86px solid rgba(255, 107, 53, 0.06);
  animation: float 12s ease-in-out infinite reverse;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-15px) rotate(3deg);
  }
}

.contribute-header {
  position: relative;
  z-index: 10;
  padding: 1.5rem 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: transparent;
  border: 1px solid rgba(0, 245, 255, 0.3);
  color: rgba(0, 245, 255, 0.7);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  min-height: 44px;
}

.back-btn:hover {
  border-color: #00f5ff;
  color: #00f5ff;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.2);
}

.contribute-main {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding: 1rem 2rem 4rem;
}

.contribute-container {
  width: 100%;
  max-width: 700px;
  padding: 2rem;
  background: rgba(10, 8, 18, 0.9);
  border: 1px solid rgba(0, 245, 255, 0.2);
  position: relative;
}

/* Corner decorations */
.contribute-container::before,
.contribute-container::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #ff6b35;
  border-style: solid;
}

.contribute-container::before {
  top: -1px;
  left: -1px;
  border-width: 3px 0 0 3px;
}

.contribute-container::after {
  bottom: -1px;
  right: -1px;
  border-width: 0 3px 3px 0;
}

/* Header section */
.contribute-header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon {
  color: #00f5ff;
  animation: pulse-icon 2s ease-in-out infinite;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
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
  font-size: 2rem;
  font-weight: 900;
  margin: 0 0 0.5rem;
  display: flex;
  justify-content: center;
  gap: 0.3rem;
}

.title-main {
  background: linear-gradient(135deg, #00f5ff, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-glitch 5s ease-in-out infinite;
}

@keyframes title-glitch {

  0%,
  90%,
  100% {
    transform: translate(0);
  }

  92% {
    transform: translate(-2px, 1px);
  }

  94% {
    transform: translate(2px, -1px);
  }
}

.contribute-subtitle {
  font-size: 0.7rem;
  color: rgba(139, 92, 246, 0.5);
  letter-spacing: 4px;
  margin: 0;
}

/* Loading state */
.init-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 245, 255, 0.2);
  border-top-color: #00f5ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.init-text {
  color: rgba(0, 245, 255, 0.5);
  font-size: 0.9rem;
  margin: 0;
}

/* Form sections */
.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #00f5ff;
  margin-bottom: 0.8rem;
  letter-spacing: 1px;
}

.topic-select {
  width: 100%;
}

/* Override naive-ui styles */
:deep(.n-base-selection) {
  --n-border: 1px solid rgba(0, 245, 255, 0.3) !important;
  --n-border-hover: 1px solid rgba(0, 245, 255, 0.5) !important;
  --n-border-focus: 1px solid #00f5ff !important;
  --n-color: rgba(10, 8, 18, 0.9) !important;
  --n-text-color: rgba(255, 255, 255, 0.9) !important;
  --n-placeholder-color: rgba(0, 245, 255, 0.4) !important;
  --n-caret-color: #00f5ff !important;
  --n-border-radius: 0;
  --n-height: 48px;
}

:deep(.n-base-selection .n-base-selection-label) {
  background: rgba(10, 8, 18, 0.8) !important;
}

.selected-topic-info {
  margin-top: 1rem;
}

.topic-time {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.8rem;
}

.time-warning {
  text-align: center;
  font-size: 0.85rem;
  padding: 0.8rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  color: #ff6b35;
  margin-bottom: 1.5rem;
}

.time-urgent {
  color: #ff6b35;
}

.time-critical {
  color: #ff4444;
  animation: pulse-critical 1s infinite;
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

.time-expired {
  color: rgba(255, 255, 255, 0.3);
  text-decoration: line-through;
}

.time-remaining {
  color: #00f5ff;
  margin-left: 0.5rem;
}

.topic-alert {
  --n-color: rgba(0, 245, 255, 0.05) !important;
  --n-border: 1px solid rgba(0, 245, 255, 0.2) !important;
}

/* Content section */
.content-section {
  position: relative;
}

.content-section.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
}

.draft-hint {
  font-size: 0.75rem;
  color: rgba(139, 92, 246, 0.4);
}

.char-counter {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.char-counter.warning {
  color: #ff9e5e;
}

.char-counter.error {
  color: #ff6b35;
}

.char-counter.under-limit {
  color: #ff9e5e;
}

.limit-hint {
  font-size: 0.7rem;
  color: #ff6b35;
  margin-left: 0.3rem;
}

/* Captcha */
.captcha-wrapper {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
}

.captcha-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 2rem;
  background: transparent;
  border: 2px solid rgba(255, 107, 53, 0.5);
  color: #ff6b35;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 52px;
}

.captcha-btn:hover:not(:disabled) {
  border-color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
  box-shadow: 0 0 25px rgba(255, 107, 53, 0.3);
}

.captcha-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.captcha-btn.is-verified {
  border-color: #00f5ff;
  color: #00f5ff;
}

.captcha-btn-icon {
  display: flex;
}

.captcha-btn-text {
  letter-spacing: 2px;
}

/* Error message */
.error-message {
  text-align: center;
  font-size: 0.85rem;
  padding: 0.8rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  color: #ff6b35;
  margin-bottom: 1.5rem;
}

/* Success state */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.success-icon {
  color: #00f5ff;
  animation: pulse-icon 1.5s ease-in-out infinite;
}

.success-message {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00f5ff;
  margin: 0;
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
}

.submission-id {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(0, 245, 255, 0.3);
  color: rgba(0, 245, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  border-color: #00f5ff;
  color: #00f5ff;
}

.success-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.continue-btn,
.back-home-btn {
  padding: 0.8rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 52px;
}

.continue-btn {
  background: transparent;
  border: 2px solid rgba(255, 107, 53, 0.5);
  color: #ff6b35;
}

.continue-btn:hover {
  border-color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
}

.back-home-btn {
  background: linear-gradient(135deg, #ff6b35, #ff9e5e);
  border: none;
  color: #fff;
}

.back-home-btn:hover {
  box-shadow: 0 0 25px rgba(255, 107, 53, 0.4);
  transform: translateY(-2px);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.empty-icon {
  color: rgba(139, 92, 246, 0.5);
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.empty-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Submit button */
.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ff6b35, #ff9e5e);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 52px;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Captcha modal */
.captcha-modal-content {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
}

.captcha-component-wrapper {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.captcha-loading,
.captcha-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.modal-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 107, 53, 0.2);
  border-top-color: #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.retry-load-btn {
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: 1px solid rgba(255, 107, 53, 0.5);
  color: #ff6b35;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.retry-load-btn:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: #ff6b35;
}

@media (max-width: 768px) {
  .contribute-header {
    padding: 1rem;
  }

  .contribute-main {
    padding: 1rem;
  }

  .contribute-container {
    padding: 1.5rem 1rem;
  }

  .contribute-title {
    font-size: 1.6rem;
  }

  .success-actions {
    flex-direction: column;
    width: 100%;
  }

  .continue-btn,
  .back-home-btn {
    width: 100%;
  }
}
</style>