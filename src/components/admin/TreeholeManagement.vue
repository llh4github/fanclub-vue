<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { NConfigProvider, darkTheme, useMessage, zhCN, dateZhCN } from "naive-ui"
import {
  getTopicPage,
  createTopic,
  updateTopic,
  setTopicStatus,
  type TopicPageItem,
} from "@/api/treeholeAdmin"
import { isSuccess } from "@/api/types"
import { Liko } from "@/config"
import { h } from "vue"
import {
  NButton,
  NDataTable,
  NModal,
  NInput,
  NSwitch,
  NPopconfirm,
  NDatePicker,
  NAutoComplete,
  NPopover,
} from "naive-ui"
import QRCode from "qrcode"
import {
  generateHolidayOptions,
  sortHolidaysByRelevance,
  filterHolidays,
  type HolidayOption,
} from "@/utils/holidays"

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const topics = ref<TopicPageItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)
const formTitle = ref("")
const formDescription = ref("")
const formTimeRange = ref<[number, number] | null>(null)
const formIsActive = ref(true)

const holidayOptions = ref<HolidayOption[]>([])
const searchValue = ref("")
const qrCodeMap = ref<Record<string, string>>({})
const activeQRPopover = ref<string | null>(null)

const filteredHolidayOptions = computed(() => {
  const allOptions = sortHolidaysByRelevance(holidayOptions.value)
  return filterHolidays(allOptions, searchValue.value)
})

const titleOptions = computed(() => {
  return filteredHolidayOptions.value.map((opt) => ({
    label: opt.label,
    value: opt.value,
  }))
})

function handleTitleSelect(value: string) {
  formTitle.value = value
  searchValue.value = ""
}

function handleTitleInput(value: string) {
  searchValue.value = value
}

const pagination = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  pageCount: total.value > 0 ? Math.ceil(total.value / pageSize.value) : 1,
  pageSizes: [10, 20, 50],
}))

const columns = [
  {
    title: "序号",
    key: "index",
    width: 80,
    render: (_row: TopicPageItem, index: number) => {
      return (page.value - 1) * pageSize.value + index + 1
    },
  },
  { title: "标题", key: "title", ellipsis: { tooltip: true }, width: 150 },
  { title: "描述", key: "description", ellipsis: true, width: 300 },
  {
    title: "时间",
    key: "open_at",
    width: 180,
    render: (row: TopicPageItem) => {
      return h("div", { class: "text-xs" }, [
        h("div", {}, `开始: ${new Date(row.open_at).toLocaleString("zh-CN")}`),
        h("div", {}, `结束: ${new Date(row.close_at).toLocaleString("zh-CN")}`),
      ])
    },
  },
  {
    title: "状态",
    key: "is_active",
    width: 100,
    render: (row: TopicPageItem) => {
      if (row.is_active) {
        if (row.total_submission_count > 0) {
          return h(
            NPopconfirm,
            {
              trigger: "click",
              negativeText: "取消",
              positiveText: "确认关闭",
              onPositiveClick: () => handleStatusChange(row, false),
            },
            {
              trigger: () => h(NSwitch, { value: true, title: "点击关闭话题" }),
              default: () =>
                `该话题下有 ${row.total_submission_count} 条投稿，关闭后将无法投稿。确定要关闭吗？`,
            },
          )
        }
        return h(NSwitch, {
          value: true,
          title: "点击关闭话题",
          onUpdateValue: () => handleStatusChange(row, false),
        })
      }
      return h(NSwitch, {
        value: false,
        title: "点击激活话题",
        onUpdateValue: () => handleStatusChange(row, true),
      })
    },
  },
  { title: "总投稿数", key: "total_submission_count", width: 80 },
  {
    title: "不宜展示投稿",
    key: "hidden_submission_count",
    width: 80,
  },
  {
    title: "操作",
    key: "actions",
    width: 360,
    render: (row: TopicPageItem) => {
      return h("div", { class: "flex gap-2" }, [
        h(
          NButton,
          { size: "small", type: "primary", onClick: () => navigateToWatch(row) },
          () => "观赏",
        ),
        h(
          NButton,
          { size: "small", type: "info", onClick: () => navigateToPureWatch(row) },
          () => "专享纯良",
        ),
        h(NButton, { size: "small", onClick: () => viewSubmissions(row) }, () => "投稿列表"),
        h(NButton, { size: "small", onClick: () => openEdit(row) }, () => "编辑"),
        h(
          NPopover,
          {
            trigger: "hover",
            show: activeQRPopover.value === String(row.id),
            "onUpdate:show": (val: boolean) => {
              activeQRPopover.value = val ? String(row.id) : null
              if (val && !qrCodeMap.value[String(row.id)]) {
                generateQRCode(row.id)
              }
            },
          },
          {
            trigger: () =>
              h(
                NButton,
                { size: "small", type: "warning", onClick: () => downloadQRCode(row.id) },
                () => "下载二维码",
              ),
            default: () => {
              const dataUrl = qrCodeMap.value[String(row.id)]
              if (dataUrl) {
                return h(
                  "div",
                  { style: "text-align: center; padding: 8px;" },
                  [
                    h("img", {
                      src: dataUrl,
                      style: "width: 160px; height: 160px; border-radius: 8px;",
                      alt: "QR Code",
                    }),
                  ],
                )
              }
              return h("div", { style: "padding: 20px; color: rgba(255, 228, 204, 0.5);" }, "加载中...")
            },
          },
        ),
      ])
    },
  },
]

function viewSubmissions(row: TopicPageItem) {
  router.push({
    name: "submission",
    params: { tab: "submission", topicId: String(row.id) },
  })
}

function navigateToWatch(row: TopicPageItem) {
  router.push({
    name: "submissionNavigateWithTopic",
    params: { topicId: String(row.id) },
  })
}

function navigateToPureWatch(row: TopicPageItem) {
  router.push({
    name: "submissionNavigateWithTopic",
    params: { topicId: String(row.id) },
    query: { onlyApproved: "true" },
  })
}

async function loadTopics() {
  loading.value = true
  try {
    const resp = await getTopicPage({ page_index: page.value - 1, page_size: pageSize.value })
    if (isSuccess(resp.code) && resp.data) {
      topics.value = resp.data.records
      total.value = resp.data.total_row_count
    } else {
      message.error(resp.msg || "加载失败")
    }
  } catch {
    message.error("加载话题失败")
  } finally {
    loading.value = false
  }
}

async function generateQRCode(topicId: string | number) {
  try {
    const key = String(topicId)
    const url = `https://www.likofan.club/contribute?topic_id=${topicId}`
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: "#1a1018",
        light: "#ffe4cc",
      },
    })
    qrCodeMap.value[key] = dataUrl
  } catch {
    message.error("二维码生成失败")
  }
}

function downloadQRCode(topicId: string | number) {
  const key = String(topicId)
  if (!qrCodeMap.value[key]) {
    generateQRCode(topicId)
  }
  setTimeout(() => {
    const dataUrl = qrCodeMap.value[key]
    if (!dataUrl) return
    const link = document.createElement("a")
    link.download = `topic-${topicId}-qrcode.png`
    link.href = dataUrl
    link.click()
  }, 100)
}

async function handleStatusChange(row: TopicPageItem, newValue: boolean) {
  try {
    const resp = await setTopicStatus(String(row.id), newValue)
    if (isSuccess(resp.code)) {
      row.is_active = newValue
      message.success(newValue ? "话题已激活" : "话题已关闭")
    } else {
      message.error(resp.msg || "状态更新失败")
    }
  } catch {
    message.error("状态更新失败")
  }
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  formTitle.value = ""
  formDescription.value = ""
  const now = Date.now()
  formTimeRange.value = [now, now + 7 * 24 * 60 * 60 * 1000]
  formIsActive.value = true
  showModal.value = true
}

function openEdit(topic: TopicPageItem) {
  isEdit.value = true
  editingId.value = String(topic.id)
  formTitle.value = topic.title
  formDescription.value = topic.description
  formTimeRange.value = [new Date(topic.open_at).getTime(), new Date(topic.close_at).getTime()]
  formIsActive.value = topic.is_active
  showModal.value = true
}

async function handleSubmit() {
  if (!formTitle.value || !formTimeRange.value) {
    message.warning("请填写完整信息")
    return
  }

  const [openAt, closeAt] = formTimeRange.value

  try {
    if (isEdit.value && editingId.value) {
      const resp = await updateTopic({
        id: editingId.value,
        title: formTitle.value,
        description: formDescription.value,
        open_at: new Date(openAt).toISOString(),
        close_at: new Date(closeAt).toISOString(),
        is_active: formIsActive.value,
      })
      if (isSuccess(resp.code)) {
        message.success("更新成功")
      } else {
        message.error(resp.msg || "更新失败")
        return
      }
    } else {
      const resp = await createTopic({
        bid: String(Liko.BID),
        title: formTitle.value,
        description: formDescription.value,
        open_at: new Date(openAt).toISOString(),
        close_at: new Date(closeAt).toISOString(),
        is_active: formIsActive.value,
      })
      if (isSuccess(resp.code)) {
        message.success("创建成功")
      } else {
        message.error(resp.msg || "创建失败")
        return
      }
    }
    showModal.value = false
    await loadTopics()
  } catch {
    message.error(isEdit.value ? "更新失败" : "创建失败")
  }
}

function handlePageChange(current: number) {
  page.value = current
  loadTopics()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  page.value = 1
  loadTopics()
}

onMounted(() => {
  loadTopics()
  const currentYear = new Date().getFullYear()
  holidayOptions.value = generateHolidayOptions(currentYear)
})
</script>

<template>
  <NConfigProvider :theme="darkTheme" :locale="zhCN" :date-locale="dateZhCN">
    <div class="treehole-management">
      <div class="header">
        <h2 class="title">话题管理</h2>
        <NButton type="primary" @click="openCreate">创建话题</NButton>
      </div>

      <NDataTable
        :columns="columns"
        :data="topics"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: TopicPageItem) => row.id"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />

      <NModal
        v-model:show="showModal"
        preset="card"
        :title="isEdit ? '编辑话题' : '创建话题'"
        style="max-width: 500px"
      >
        <div class="form">
          <div class="form-item">
            <label>标题</label>
            <NAutoComplete
              v-model:value="formTitle"
              :options="titleOptions"
              placeholder="请输入话题标题或选择节假日"
              clearable
              placement="bottom-start"
              :style="{ zIndex: 1000 }"
              :maxlength="100"
              show-count
              @update:value="handleTitleInput"
              @select="handleTitleSelect"
            />
          </div>
          <div class="form-item">
            <label>描述</label>
            <NInput
              v-model:value="formDescription"
              type="textarea"
              placeholder="请输入话题描述"
              :rows="3"
              :maxlength="300"
              show-count
            />
          </div>
          <div class="form-item">
            <label>投稿时间范围</label>
            <NDatePicker
              v-model:value="formTimeRange"
              type="datetimerange"
              clearable
              style="width: 100%"
            />
          </div>
          <div class="form-item">
            <label>启用</label>
            <NSwitch v-model:value="formIsActive" />
          </div>
          <div class="form-actions">
            <NButton @click="showModal = false">取消</NButton>
            <NButton type="primary" @click="handleSubmit">确认</NButton>
          </div>
        </div>
      </NModal>
    </div>
  </NConfigProvider>
</template>

<style scoped>
.treehole-management {
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.title {
  color: #ffe4cc;
  font-size: 1.25rem;
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #ffe4cc;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>
