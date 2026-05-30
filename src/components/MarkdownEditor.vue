<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, onErrorCaptured } from "vue"
import Vditor from "vditor"
import "vditor/dist/index.css"
import * as qiniu from "qiniu-js"
import { getImageUploadCredential } from "@/api/oss"
import { isSuccess } from "@/api/types"
import { useMessage } from "naive-ui"
import markdownit from "markdown-it"

const message = useMessage()
const md = markdownit()

const MAX_CHARS = 800
const MIN_CHARS = 10
const MAX_IMAGES_PER_DRAFT = 5
const MAX_IMAGES_PER_TOPIC_3H = 12
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const TOPIC_UPLOAD_WINDOW_MS = 3 * 60 * 60 * 1000 // 3 hours

function getTopicUploadCache(topicId: string): { count: number; resetAt: number } | null {
  try {
    const key = `topic_upload_${topicId}`
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const data = JSON.parse(cached)
    const now = Date.now()
    if (now - data.lastUploadTime > TOPIC_UPLOAD_WINDOW_MS) {
      localStorage.removeItem(key)
      return null
    }
    return { count: data.count, resetAt: data.lastUploadTime + TOPIC_UPLOAD_WINDOW_MS }
  } catch {
    return null
  }
}

function updateTopicUploadCache(topicId: string, count: number): void {
  try {
    const key = `topic_upload_${topicId}`
    localStorage.setItem(key, JSON.stringify({ count, lastUploadTime: Date.now() }))
  } catch {
    // ignore
  }
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    disabled?: boolean
    placeholder?: string
    height?: string | number
    topicId?: string
  }>(),
  {
    modelValue: "",
    disabled: false,
    placeholder: "请输入内容...",
    height: 400,
    topicId: "",
  },
)

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const vditorContainer = ref<HTMLDivElement | null>(null)
let vditorInstance: Vditor | null = null
let isInitializing = true
let isDelayedInit = false

function countMdText(markdown: string): number {
  if (!markdown) return 0
  try {
    const html = md.render(markdown)
    const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, "")
    return text.length
  } catch {
    return markdown.length
  }
}

const charCountRef = ref(0)
const isOverLimitRef = ref(false)
const isNearLimitRef = ref(false)
const isUnderLimitRef = ref(false)
const isValidRef = ref(false)
const uploadedImageCount = ref(0)
const topicImageUploadCount = ref(0)
const topicCountResetAt = ref(0)

const isImageLimitReached = computed(() => uploadedImageCount.value >= MAX_IMAGES_PER_DRAFT)
const isTopicUploadBlocked = computed(() => topicImageUploadCount.value >= MAX_IMAGES_PER_TOPIC_3H)

const charCount = computed(() => {
  if (!props.modelValue) return 0
  return countMdText(props.modelValue)
})

const isOverLimit = computed(() => charCount.value > MAX_CHARS)
const isNearLimit = computed(() => charCount.value > MAX_CHARS * 0.9)
const isUnderLimit = computed(() => charCount.value < MIN_CHARS)
const isValid = computed(() => charCount.value >= MIN_CHARS && charCount.value <= MAX_CHARS)

watch(
  [charCount, isOverLimit, isNearLimit, isUnderLimit, isValid],
  ([cc, over, near, under, valid]) => {
    charCountRef.value = cc
    isOverLimitRef.value = over
    isNearLimitRef.value = near
    isUnderLimitRef.value = under
    isValidRef.value = valid
  },
  { immediate: true },
)

defineExpose({
  charCount: charCountRef,
  isOverLimit: isOverLimitRef,
  isNearLimit: isNearLimitRef,
  isUnderLimit: isUnderLimitRef,
  isValid: isValidRef,
  uploadedImageCount,
  isImageLimitReached,
  isTopicUploadBlocked,
  topicImageUploadCount,
  MIN_CHARS,
  MAX_CHARS,
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (!isDelayedInit) return
    try {
      if (vditorInstance) {
        const currentValue = vditorInstance.getValue()
        if (newVal !== currentValue) {
          vditorInstance.setValue(newVal || "")
        }
      }
    } catch {
      // ignore
    }
  },
)

let lastEmittedValue = ""

function handleChange(value: string) {
  if (isInitializing) return
  if (value === lastEmittedValue) return
  lastEmittedValue = value
  try {
    if (countMdText(value) > MAX_CHARS) {
      const lines = value.split("\n")
      let result = ""
      let count = 0

      for (const line of lines) {
        const lineCount = countMdText(line)
        if (count + lineCount > MAX_CHARS) {
          break
        }
        result += line + "\n"
        count += lineCount
      }

      const trimmed = result.trimEnd()
      if (trimmed !== value) {
        syncImageCount(trimmed)
        vditorInstance?.setValue(trimmed)
        emit("update:modelValue", trimmed)
      } else {
        const filtered = filterExternalLinks(value)
        syncImageCount(filtered)
        emit("update:modelValue", filtered)
      }
    } else {
      const filtered = filterExternalLinks(value)
      syncImageCount(filtered)
      if (filtered !== value) {
        vditorInstance?.setValue(filtered)
      }
      emit("update:modelValue", filtered)
    }
  } catch {
    // ignore
  }
}

function filterExternalLinks(text: string): string {
  return text.replace(/\[([^\]]*)\]\((https?:\/\/(?![\w-]+\.likofan\.club)[^)]+)\)/g, "$1")
}

function countImagesInMarkdown(text: string): number {
  const matches = text.match(/!\[([^\]]*)\]\(([^)]+)\)/g)
  return matches ? matches.length : 0
}

function syncImageCount(markdown: string): void {
  const currentImageCount = countImagesInMarkdown(markdown)
  const diff = uploadedImageCount.value - currentImageCount
  if (diff > 0) {
    uploadedImageCount.value = currentImageCount
    // Don't decrement topicImageUploadCount - total uploads persist per requirements
  }
}

function checkTopicImageCount(): boolean {
  if (!props.topicId) return true
  const cached = getTopicUploadCache(props.topicId)
  if (cached) {
    topicImageUploadCount.value = cached.count
    topicCountResetAt.value = cached.resetAt
    return cached.count < MAX_IMAGES_PER_TOPIC_3H
  }
  topicImageUploadCount.value = 0
  topicCountResetAt.value = Date.now() + TOPIC_UPLOAD_WINDOW_MS
  return true
}

async function uploadImage(files: File[], vditor: Vditor): Promise<void> {
  const canUpload = checkTopicImageCount()
  if (!canUpload) {
    const remainingMins = Math.ceil((topicCountResetAt.value - Date.now()) / 60000)
    message.warning(`上传太频繁，请在 ${remainingMins} 分钟后重试`)
    return
  }

  const remainingTopicSlots = MAX_IMAGES_PER_TOPIC_3H - topicImageUploadCount.value
  const remainingDraftSlots = MAX_IMAGES_PER_DRAFT - uploadedImageCount.value
  const maxUpload = Math.min(remainingTopicSlots, remainingDraftSlots, files.length)
  const validFiles = files.slice(0, maxUpload)

  if (files.length > maxUpload) {
    message.warning(`本话题 3 小时内已上传 ${topicImageUploadCount.value} 张图片，当前稿件最多还能上传 ${maxUpload} 张`)
  }

  for (const file of validFiles) {
    if (file.size > MAX_IMAGE_SIZE) {
      message.warning(`图片 ${file.name} 超过 5MB 限制，已跳过`)
      continue
    }

    try {
      const key = `${Date.now()}-${file.name}`
      const credentialResp = await getImageUploadCredential(key)

      if (!isSuccess(credentialResp.code) || !credentialResp.data) {
        console.error("Failed to get upload credential:", credentialResp)
        message.error(`获取上传凭证失败`)
        continue
      }

      const { token, object_key, region } = credentialResp.data
      console.log("[uploadImage] credential:", { region, object_key })

      const regionMap = {
        z0: qiniu.region.z0,
        z1: qiniu.region.z1,
        z2: qiniu.region.z2,
        na0: qiniu.region.na0,
        as0: qiniu.region.as0,
      }

      const config = {
        region: regionMap[region as keyof typeof regionMap] || qiniu.region.z0,
        useCdnDomain: false,
      }

      const observable = qiniu.upload(file, object_key, token, undefined, config)

      const result = await new Promise<{ key: string }>((resolve, reject) => {
        observable.subscribe({
          next: () => { },
          error: (err) => {
            console.error("Upload failed:", err)
            reject(err)
          },
          complete: (res) => {
            resolve(res)
          },
        })
      })

      const cdnDomain = import.meta.env.VITE_QINIU_CDN_DOMAIN || ""
      if (cdnDomain) {
        const imageUrl = `${cdnDomain}/${result.key}-thumbnail`
        vditor.insertValue(`![${file.name}](${imageUrl})`)
        uploadedImageCount.value++
        topicImageUploadCount.value++
        updateTopicUploadCache(props.topicId, topicImageUploadCount.value)
      }
    } catch (error) {
      console.error("Upload failed:", error)
      message.error(`图片 ${file.name} 上传失败`)
    }
  }
}

onMounted(() => {
  isDelayedInit = true
  if (vditorContainer.value) {
    setTimeout(() => {
      initVditor()
    }, 100)
  }
})

function initVditor() {
  if (!vditorContainer.value || vditorInstance) return
  isInitializing = false
  vditorInstance = new Vditor(vditorContainer.value, {
    value: props.modelValue || "",
    placeholder: props.placeholder,
    mode: "wysiwyg",
    theme: "dark",
    height: 400,
    toolbarConfig: {
      pin: true,
      hide: false,
    },
    customWysiwygToolbar: () => [],
    toolbar: [
      "headings",
      "bold",
      "italic",
      "strike",
      "line",
      "quote",
      "list",
      "ordered-list",
      "code",
      "inline-code",
      "table",
      "upload",
      "undo",
      "redo",
      "preview",
    ],
    input: (value) => {
      handleChange(value)
    },
    upload: {
      accept: "image/*",
      handler: async (files) => {
        if (isTopicUploadBlocked.value) {
          const remainingMins = Math.ceil((topicCountResetAt.value * 1000 - Date.now()) / 60000)
          message.warning(`上传太频繁，请在 ${remainingMins} 分钟后重试`)
          return null
        }
        if (uploadedImageCount.value >= MAX_IMAGES_PER_DRAFT) {
          message.warning(`每篇稿件最多只能上传 ${MAX_IMAGES_PER_DRAFT} 张图片`)
          return null
        }
        if (vditorInstance) {
          uploadImage(files as File[], vditorInstance)
        }
        return null
      },
    },
    preview: {
      mode: "both",
      theme: {
        current: "light",
        path: "https://cdn.jsdelivr.net/npm/vditor@3.11.2/dist",
      },
    },
    outline: {
      enable: false,
      position: "right",
    },
    counter: {
      enable: false,
    },
    resize: {
      enable: false,
    },
    debugger: false,
    hint: {
      emojiPath: "https://cdn.jsdelivr.net/npm/vditor@3.11.2/dist/images/emoji",
      emojiTail: "",
    },
    cache: {
      enable: false,
    },
    after: () => {
      if (vditorInstance) {
        vditorInstance.setTheme("classic")
      }
    },
  })
}

onBeforeUnmount(() => {
  if (vditorInstance) {
    vditorInstance.destroy()
    vditorInstance = null
  }
})

onErrorCaptured((err) => {
  console.warn("[MarkdownEditor] captured error:", err)
  return false
})

watch(
  () => props.disabled,
  (newVal) => {
    if (vditorInstance) {
      if (newVal) {
        vditorInstance.disabled()
      } else {
        vditorInstance.enable()
      }
    }
  },
)
</script>

<template>
  <div class="vditor-wrapper">
    <div ref="vditorContainer" class="vditor-container"></div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.vditor-wrapper {
  @apply w-full;
  display: flex;
  flex-direction: column;
}

.vditor-container {
  @apply w-full;
  overflow: hidden;
}

.vditor-wrapper :deep(.vditor) {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  max-height: v-bind("`${props.height}px`");
  overflow: hidden;
}
</style>