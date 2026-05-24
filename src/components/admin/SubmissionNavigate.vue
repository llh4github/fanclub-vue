<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import markdownit from "markdown-it"
import {
  NConfigProvider,
  darkTheme,
  NButton,
  NAlert,
  NSplit,
  NPagination,
  useMessage,
  type GlobalThemeOverrides,
} from "naive-ui"
import {
  getSubmissionNavigate,
  getTopicDetail,
  updateSubmissionStatus,
  type SubmissionNavItem,
} from "@/api/treeholeAdmin"
import { isSuccess } from "@/api/types"

const router = useRouter()
const route = useRoute()
const message = useMessage()

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
})

const props = defineProps<{
  topicId?: string | number
}>()

const THEME_KEY = "submission-theme"
const FONT_SIZE_KEY = "submission-font-size"
const isDark = ref(true)
const topicTitle = ref("")
const fontSize = ref("base")

const lightThemeOverrides: GlobalThemeOverrides = {
  Pagination: {
    itemTextColor: "#3d3629",
    itemTextColorHover: "#DF7623",
    itemTextColorActive: "#DF7623",
    jumperTextColor: "#3d3629",
    suffixTextColor: "#3d3629",
    prefixTextColor: "#3d3629",
    buttonIconColor: "#3d3629",
    buttonIconColorHover: "#DF7623",
    buttonIconColorPressed: "#DF7623",
    buttonBorder: "1px solid #d4c5a9",
    buttonBorderHover: "1px solid #DF7623",
    buttonBorderPressed: "1px solid #DF7623",
  },
  Input: {
    textColor: "#3d3629",
    color: "#fff",
    colorFocus: "rgba(223, 118, 35, 0.1)",
    borderFocus: "1px solid #DF7623",
  },
}

const fontSizeOptions = [
  { value: "sm", label: "小" },
  { value: "base", label: "中" },
  { value: "lg", label: "大" },
  { value: "xl", label: "特大" },
]

const currentPageIndex = ref(1)
const totalCount = ref(0)
const loading = ref(false)
const currentSubmission = ref<SubmissionNavItem | null>(null)
const selectedSubmission = ref<SubmissionNavItem | null>(null)

watch(selectedSubmission, () => {
  summaryContent.value = ""
  summarySource.value = null
  summaryDone.value = false
})

const rejectLoading = ref(false)
const showLoading = ref(false)
const summaryLoading = ref(false)
const summaryContent = ref("")
const summarySource = ref<"stream" | "cache" | null>(null)
const summaryDone = ref(false)

const summaryHtml = computed(() => {
  if (!summaryContent.value) return ""
  return md.render(summaryContent.value)
})

const BV_REGEX = /BV[a-zA-Z0-9]{10}/g

function extractBVNumbers(html: string): string[] {
  const matches = html.match(BV_REGEX) || []
  return [...new Set(matches)].slice(0, 3)
}

const extractedBVNumbers = computed(() => {
  if (!selectedSubmission.value?.content_html) return []
  return extractBVNumbers(selectedSubmission.value.content_html)
})

function getVideoUrl(bv: string): string {
  return `https://player.bilibili.com/player.html?bvid=${bv}&high_quality=1&autoplay=0&danmaku=0`
}

const showButtonText = computed(() => {
  if (!currentSubmission.value) return "无法操作"
  return currentSubmission.value.audit_status !== 2 ? "纯良并展示" : "展示"
})

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  isDark.value = saved ? saved === "dark" : true
}

function loadFontSize() {
  const saved = localStorage.getItem(FONT_SIZE_KEY)
  if (saved && fontSizeOptions.some((o) => o.value === saved)) {
    fontSize.value = saved
  }
}

function changeFontSize(newSize: string) {
  fontSize.value = newSize
  localStorage.setItem(FONT_SIZE_KEY, newSize)
}

async function loadTopicDetail() {
  if (!props.topicId) return
  try {
    const resp = await getTopicDetail(props.topicId)
    if (isSuccess(resp.code) && resp.data) {
      topicTitle.value = resp.data.title
    }
  } catch {
    topicTitle.value = ""
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem(THEME_KEY, isDark.value ? "dark" : "light")
}

async function showSubmission() {
  if (!currentSubmission.value) return

  if (currentSubmission.value.audit_status !== 2) {
    showLoading.value = true
    try {
      const resp = await updateSubmissionStatus(currentSubmission.value.id, 2)
      if (isSuccess(resp.code)) {
        message.success("已标记为可以展示")
        await loadSubmissionByPage(currentPageIndex.value)
        if (currentSubmission.value && currentSubmission.value.audit_status === 2) {
          selectedSubmission.value = currentSubmission.value
        } else {
          message.warning("数据已被修改，请刷新后重试")
        }
      } else {
        message.error(resp.msg || "操作失败")
      }
    } catch {
      message.error("操作失败")
    } finally {
      showLoading.value = false
    }
  } else {
    selectedSubmission.value = currentSubmission.value
  }
}

async function loadSummary() {
  if (!selectedSubmission.value) return

  summaryLoading.value = true
  summaryContent.value = ""
  summarySource.value = null
  summaryDone.value = false

  try {
    const hasSummary = selectedSubmission.value.has_summary ?? false
    const apiPath = hasSummary ? "summary" : "summary/stream"
    const url = `/api/treehole/submission/${apiPath}?submission_id=${selectedSubmission.value.id}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const source = response.headers.get("X-Summary-Source") as "stream" | "cache" | null
    summarySource.value = source

    if (source === "stream") {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("无法读取响应流")
      }

      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        let currentEventType = ""
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          console.log("[SSE] line:", line)
          if (line.startsWith("event: ")) {
            currentEventType = line.slice(6).trim()
            console.log("[SSE] event type:", currentEventType)
            continue
          }
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim()
            try {
              const event = JSON.parse(jsonStr)
              if (currentEventType === "done") {
                console.log("[SSE] done")
                summaryDone.value = true
                break
              }
              if (currentEventType === "error") {
                console.log("[SSE] error:", event.content)
                message.error(event.content || "生成失败")
                break
              }
              if (event.content) {
                summaryContent.value += event.content
                console.log("[SSE] added content:", event.content)
              }
            } catch {
              console.log("[SSE] parse error:", jsonStr)
            }
          }
        }
      }
    } else {
      const text = await response.text()
      const result = JSON.parse(text)
      if (result.data?.content) {
        summaryContent.value = result.data.content
        summaryDone.value = true
      }
    }
  } catch {
    message.error("获取总结失败")
  } finally {
    summaryLoading.value = false
  }
}

async function rejectSubmission() {
  if (!currentSubmission.value) return
  rejectLoading.value = true
  try {
    const resp = await updateSubmissionStatus(currentSubmission.value.id, 0)
    if (isSuccess(resp.code)) {
      message.success("已标记为不宜展示")
      await loadSubmissionByPage(currentPageIndex.value)
    } else {
      message.error(resp.msg || "操作失败")
    }
  } catch {
    message.error("操作失败")
  } finally {
    rejectLoading.value = false
  }
}

async function loadSubmissions() {
  loading.value = true
  try {
    const pageToLoad = Number(route.query.index) || 1
    const onlyApproved = route.query.onlyApproved === "true"
    const resp = await getSubmissionNavigate(props.topicId ?? 0, pageToLoad, onlyApproved)
    if (isSuccess(resp.code) && resp.data) {
      currentPageIndex.value = resp.data.page_index
      totalCount.value = resp.data.total_count
      currentSubmission.value = resp.data.record
    } else {
      message.error(resp.msg || "加载失败")
    }
  } catch {
    message.error("加载投稿失败")
  } finally {
    loading.value = false
  }
}

async function loadSubmissionByPage(pageIndex: number) {
  loading.value = true
  try {
    const onlyApproved = route.query.onlyApproved === "true"
    const resp = await getSubmissionNavigate(props.topicId ?? 0, pageIndex, onlyApproved)
    if (isSuccess(resp.code) && resp.data) {
      currentPageIndex.value = resp.data.page_index
      totalCount.value = resp.data.total_count
      currentSubmission.value = resp.data.record
    } else {
      message.error(resp.msg || "加载失败")
    }
  } catch {
    message.error("加载投稿失败")
  } finally {
    loading.value = false
  }
}

function onPageChange(page: number) {
  if (props.topicId) {
    router.replace({
      name: "submissionNavigateWithTopic",
      params: { topicId: props.topicId },
      query: { index: page },
    })
  }
  loadSubmissionByPage(page)
}

function backToList() {
  router.push({ name: "treehole" })
}

onMounted(() => {
  loadTheme()
  loadFontSize()
  loadTopicDetail()
  loadSubmissions()
})

watch(
  () => [props.topicId, () => route.query.index],
  () => {
    loadTopicDetail()
    loadSubmissions()
  },
)
</script>

<template>
  <NConfigProvider
    :theme="isDark ? darkTheme : undefined"
    :theme-overrides="isDark ? undefined : lightThemeOverrides"
  >
    <div class="navigate-page" :class="{ 'theme-light': !isDark }">
      <div class="header">
        <div class="header-left">
          <NButton size="small" quaternary circle @click="backToList"> ← </NButton>
          <h2 class="title">
            {{ topicTitle ? `直播观赏 - ${topicTitle}` : "直播观赏" }}
          </h2>
        </div>
        <div class="nav-controls">
          <NButton size="small" @click="toggleTheme">
            {{ isDark ? "☀️" : "🌙" }}
          </NButton>
        </div>
      </div>

      <NSplit direction="horizontal" :default-ratio="0.5" class="split-panel">
        <template #1>
          <div class="left-panel">
            <NSplit direction="vertical" :default-ratio="0.7">
              <template #1>
                <div
                  class="submission-content mx-auto bg-white dark:bg-zinc-900 shadow-lg rounded-md p-4 sm:p-6 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-auto"
                >
                  <div v-if="loading" class="loading">加载中...</div>
                  <div v-else-if="!selectedSubmission" class="empty">点击右侧"展示"按钮</div>
                  <template v-else>
                    <div class="submission-header">
                      <span class="submission-id">ID: {{ selectedSubmission.submission_id }}</span>
                      <span class="submission-time">{{
                        new Date(selectedSubmission.submit_time).toLocaleString("zh-CN")
                      }}</span>
                    </div>
                    <div
                      class="content-html prose"
                      :class="{
                        'prose-invert': isDark,
                        'prose-sm': fontSize === 'sm',
                        'prose-lg': fontSize === 'lg',
                        'prose-xl': fontSize === 'xl',
                      }"
                      v-viewer
                      v-html="selectedSubmission.content_html"
                    ></div>
                  </template>
                </div>
              </template>
              <template #2>
                <div v-if="selectedSubmission" class="submission-meta">
                  <div class="meta-nav">
                    <button
                      class="font-btn"
                      :class="{ active: fontSize === 'sm' }"
                      @click="changeFontSize('sm')"
                    >
                      <span style="font-size: 10px">A</span>
                    </button>
                    <button
                      class="font-btn"
                      :class="{ active: fontSize === 'base' }"
                      @click="changeFontSize('base')"
                    >
                      <span style="font-size: 12px">A</span>
                    </button>
                    <button
                      class="font-btn"
                      :class="{ active: fontSize === 'lg' }"
                      @click="changeFontSize('lg')"
                    >
                      <span style="font-size: 14px">A</span>
                    </button>
                    <button
                      class="font-btn"
                      :class="{ active: fontSize === 'xl' }"
                      @click="changeFontSize('xl')"
                    >
                      <span style="font-size: 16px">A</span>
                    </button>
                    <div class="summary-toolbar">
                      <NButton
                        size="tiny"
                        @click="loadSummary"
                        :disabled="summaryLoading || summaryDone"
                        :loading="summaryLoading"
                      >
                        Deep♀Liko
                      </NButton>
                    </div>
                  </div>
                  <div v-if="summaryContent" class="summary-content">
                    <div class="summary-header">
                      <span class="summary-source">{{
                        summaryDone
                          ? "总结完成"
                          : summarySource === "stream"
                            ? "AI生成中..."
                            : "缓存"
                      }}</span>
                    </div>
                    <div
                      class="summary-text prose"
                      :class="{ 'prose-invert': isDark }"
                      v-html="summaryHtml"
                    ></div>
                  </div>
                  <div v-if="extractedBVNumbers.length > 0" class="bv-videos">
                    <div class="bv-videos-header">相关视频</div>
                    <div class="bv-videos-grid">
                      <div v-for="bv in extractedBVNumbers" :key="bv" class="bv-video-item">
                        <iframe
                          :src="getVideoUrl(bv)"
                          frameborder="0"
                          allowfullscreen
                          scrolling="no"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </NSplit>
          </div>
        </template>
        <template #2>
          <div class="right-panel">
            <div class="preview-warning">
              <NAlert type="warning" :bordered="false"> 此处用于预览稿件，不宜直接展示 </NAlert>
            </div>
            <div v-if="currentSubmission" class="content-nav">
              <NButton
                size="small"
                @click="showSubmission"
                :disabled="showLoading || loading"
                type="primary"
                :loading="showLoading"
              >
                {{ showButtonText }}
              </NButton>
              <NButton
                size="small"
                @click="rejectSubmission"
                :disabled="rejectLoading || loading"
                type="error"
              >
                不宜展示
              </NButton>
              <NPagination
                v-model:page="currentPageIndex"
                :page-count="totalCount"
                simple
                size="small"
                @update:page="onPageChange"
              />
            </div>
            <div v-if="loading" class="loading">加载中...</div>
            <div v-else-if="!currentSubmission" class="empty">暂无数据</div>
            <div v-else class="submission-info">
              <div
                class="content-html prose"
                :class="{
                  'prose-sm': fontSize === 'sm',
                  'prose-lg': fontSize === 'lg',
                  'prose-xl': fontSize === 'xl',
                  'prose-invert': isDark,
                }"
                v-viewer
                v-html="currentSubmission.content_html"
              ></div>
            </div>
          </div>
        </template>
      </NSplit>
    </div>
  </NConfigProvider>
</template>

<style scoped>
@reference "tailwindcss";

.navigate-page {
  @apply h-[calc(100vh-80px)] flex flex-col;
  background: rgba(26, 16, 24, 0.5);
  border-radius: 12px;
  overflow: hidden;
}

.navigate-page.theme-light {
  background: #faf8f3;
}

.header {
  @apply flex items-center justify-between p-4;
  background: rgba(26, 16, 24, 0.8);
  border-bottom: 1px solid rgba(223, 118, 35, 0.15);
  transition: all 0.3s ease;
}

.header-left {
  @apply flex items-center gap-3;
}

.theme-light .header {
  background: #fff;
  border-bottom: 1px solid #e5e0d8;
}

.title {
  @apply text-lg font-bold m-0;
  color: #ffe4cc;
}

.theme-light .title {
  color: #3d3629;
}

.nav-controls {
  @apply flex items-center gap-3;
}

.counter {
  @apply text-sm;
  color: rgba(255, 228, 204, 0.7);
  min-width: 80px;
  text-align: center;
}

.theme-light .counter {
  color: rgba(61, 54, 41, 0.7);
}

.split-panel {
  @apply flex-1;
}

.left-panel {
  @apply h-full flex flex-col p-4;
  background: rgba(26, 16, 24, 0.3);
}

.theme-light .left-panel {
  background: #f5f0e6;
}

.left-panel .content-html {
  position: relative;
  z-index: 1;
}

.submission-content {
  @apply h-full overflow-auto relative;
  width: 100%;
  box-sizing: border-box;
}

.theme-light .submission-content {
  background: #faf8f3;
}

.submission-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-700;
}

.submission-id {
  @apply text-xs font-mono;
  color: #6b7280;
}

.submission-time {
  @apply text-xs;
  color: #9ca3af;
}

.theme-light .submission-id,
.theme-light .submission-time {
  color: #9ca3af;
}

.submission-meta {
  @apply p-4 w-full box-border flex flex-col gap-3;
  border-top: 1px solid rgba(223, 118, 35, 0.15);
}

.meta-nav {
  @apply flex items-center gap-2;
}

.font-btn {
  @apply px-2 py-1 rounded cursor-pointer;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.24);
  color: rgba(255, 255, 255, 0.82);
  transition: all 0.2s ease;
}

.font-btn:hover {
  border-color: #df7623;
  color: #ff9e5e;
}

.font-btn.active {
  background: rgba(223, 118, 35, 0.2);
  border-color: #df7623;
  color: #ff9e5e;
}

.theme-light .font-btn {
  border-color: rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.82);
}

.theme-light .font-btn:hover {
  border-color: #df7623;
  color: #d97706;
}

.theme-light .font-btn.active {
  background: rgba(223, 118, 35, 0.15);
  border-color: #df7623;
  color: #d97706;
}

.summary-toolbar {
  @apply flex items-center gap-2;
}

.theme-light .submission-meta {
  border-top-color: #d4c5a9;
}

.theme-light .n-button {
  --n-text-color: rgba(0, 0, 0, 0.82) !important;
  --n-text-color-hover: #d97706 !important;
  --n-text-color-pressed: #df7623 !important;
  --n-text-color-focus: #d97706 !important;
  --n-border: 1px solid rgba(0, 0, 0, 0.15) !important;
  --n-border-hover: 1px solid #d97706 !important;
  --n-border-pressed: 1px solid #df7623 !important;
  --n-border-focus: 1px solid #d97706 !important;
}

.right-panel {
  @apply h-full flex flex-col p-4;
  background: rgba(26, 16, 24, 0.5);
}

.preview-warning {
  @apply mb-4;
}

.theme-light .preview-warning {
  background: #fef3c7;
}

.theme-light .right-panel {
  background: #faf8f3;
  border-left: 1px solid #d4c5a9;
}

.content-nav {
  @apply flex items-center justify-center gap-3 pb-4;
  flex-shrink: 0;
}

.content-nav .divider {
  width: 1px;
  height: 20px;
  background: rgba(223, 118, 35, 0.3);
  margin: 0 4px;
}

.theme-light .content-nav .divider {
  background: #d4c5a9;
}

.theme-light .n-pagination {
  color: #3d3629;
}

.theme-light .n-pagination .n-pagination-item:hover {
  color: #df7623;
}

.theme-light .n-pagination .n-pagination-item--active {
  color: #df7623;
}

.theme-light .n-pagination .n-pagination-quick-jumper {
  color: #3d3629;
}

.loading,
.empty {
  @apply flex items-center justify-center h-full text-sm;
  color: rgba(255, 228, 204, 0.5);
}

.theme-light .loading,
.theme-light .empty {
  color: #8b7355;
}

.info-row {
  @apply flex items-start gap-2;
}

.label {
  @apply text-sm font-medium;
  color: #ff9e5e;
  min-width: 70px;
}

.theme-light .label {
  color: #8b7355;
}

.value {
  @apply text-sm;
  color: #ffe4cc;
}

.theme-light .value {
  color: #4a3f2f;
}

.submission-info {
  @apply flex-1 overflow-auto;
  display: flex;
  flex-direction: column;
}

.content-html {
  @apply h-full flex flex-col;
  min-height: 0;
  width: 100%;
  max-width: none;
}

.content-html :deep(img) {
  cursor: zoom-in;
  transition: opacity 0.2s ease;
}

.content-html :deep(img:hover) {
  opacity: 0.8;
}

.theme-light .content-html {
  color: rgba(0, 0, 0, 0.82);
}

.theme-light .content-html :deep(h1),
.theme-light .content-html :deep(h2),
.theme-light .content-html :deep(h3),
.theme-light .content-html :deep(h4),
.theme-light .content-html :deep(h5),
.theme-light .content-html :deep(h6) {
  color: rgba(0, 0, 0, 0.9);
  border-bottom-color: rgba(0, 0, 0, 0.15);
}

.theme-light .content-html :deep(p) {
  color: rgba(0, 0, 0, 0.82);
}

.theme-light .content-html :deep(a) {
  color: #d97706;
}

.theme-light .content-html :deep(blockquote) {
  border-left-color: rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.7);
}

.theme-light .content-html :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.82);
}

.theme-light .content-html :deep(pre) {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.15);
}

.theme-light .content-html :deep(table) {
  border-color: rgba(0, 0, 0, 0.15);
}

.theme-light .content-html :deep(th),
.theme-light .content-html :deep(td) {
  border-color: rgba(0, 0, 0, 0.15);
}

.theme-light .content-html :deep(strong) {
  color: rgba(0, 0, 0, 0.9);
}

.theme-light .content-html :deep(em) {
  color: rgba(0, 0, 0, 0.75);
}

.summary-content {
  @apply mt-2 p-3 rounded bg-zinc-800/50 dark:bg-zinc-800/50;
  max-height: 200px;
  overflow-y: auto;
}

.theme-light .summary-content {
  @apply bg-zinc-100;
}

.summary-header {
  @apply mb-2 text-xs;
}

.summary-source {
  @apply px-2 py-1 rounded text-xs;
  @apply bg-orange-500/20 text-orange-400;
}

.theme-light .summary-source {
  @apply bg-orange-100 text-orange-600;
}

.summary-text {
  @apply text-sm leading-relaxed;
  color: rgba(255, 228, 204, 0.9);
}

.theme-light .summary-text {
  color: rgba(0, 0, 0, 0.82);
}

.bv-videos {
  @apply mt-3 pt-3 border-t border-zinc-700;
}

.bv-videos-header {
  @apply text-xs font-medium mb-2;
  color: rgba(255, 228, 204, 0.7);
}

.theme-light .bv-videos {
  @apply border-zinc-300;
}

.theme-light .bv-videos-header {
  color: #8b7355;
}

.bv-videos-grid {
  @apply grid gap-2;
  grid-template-columns: repeat(3, 1fr);
}

.bv-video-item {
  @apply rounded overflow-hidden;
  aspect-ratio: 16 / 9;
}

.bv-video-item iframe {
  @apply w-full h-full;
}
</style>
