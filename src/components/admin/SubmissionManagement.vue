<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import {
  getSubmissionPage,
  updateSubmissionStatus,
  type Submission,
  type SubmissionPageReq,
} from "@/api/treeholeAdmin"
import { isSuccess } from "@/api/types"
import {
  NDataTable,
  NButton,
  NTag,
  useMessage,
  NConfigProvider,
  darkTheme,
  NInput,
} from "naive-ui"
import type { DataTableColumns } from "naive-ui"
import { h } from "vue"

const router = useRouter()
const props = defineProps<{
  topicId?: string | number
}>()

const message = useMessage()

const loading = ref(false)
const submissions = ref<Submission[]>([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  pageCount: 1,
  total: 0,
  pageSizes: [10, 20, 50],
  showSizePicker: true,
  prefix: ({ itemCount }: { itemCount: number | undefined }) => `共 ${itemCount} 条`,
})

const auditStatusFilter = ref<number | undefined>(undefined)
const submissionIdFilter = ref("")

const statusMap: Record<
  number,
  { label: string; type: "default" | "warning" | "success" | "error" }
> = {
  0: { label: "不宜展示", type: "error" },
  1: { label: "未审核", type: "warning" },
  2: { label: "纯良", type: "success" },
}

const columns: DataTableColumns<Submission> = [
  {
    title: "序号",
    key: "index",
    width: 80,
    render: (_row: Submission, index: number) => {
      return (pagination.value.page - 1) * pagination.value.pageSize + index + 1
    },
  },
  {
    title: "投稿ID",
    key: "submission_id",
    width: 140,
  },
  {
    title: "摘要",
    key: "summary",
    ellipsis: true,
    width: 200,
  },
  {
    title: "状态",
    key: "audit_status",
    width: 100,
    render: (row) => {
      const status = statusMap[row.audit_status] || statusMap[1]
      return h(NTag, { type: status.type, size: "small" }, () => status.label)
    },
  },
  {
    title: "提交时间",
    key: "submit_time",
    width: 160,
    render: (row) => new Date(row.submit_time).toLocaleString("zh-CN"),
  },
  {
    title: "操作",
    key: "actions",
    width: 320,
    fixed: "right",
    render: (row) => {
      const isGood = row.audit_status === 2
      const isHidden = row.audit_status === 0
      const buttons = [
        h(
          NButton,
          {
            size: "small",
            type: "success",
            disabled: isGood,
            onClick: () => handleAudit(row, 2),
          },
          () => "纯良",
        ),
        h(
          NButton,
          {
            size: "small",
            type: "error",
            disabled: isHidden,
            onClick: () => handleAudit(row, 0),
          },
          () => "不宜展示",
        ),
      ]

      return h("div", { class: "flex gap-2" }, buttons)
    },
  },
]

async function loadSubmissions() {
  loading.value = true
  try {
    const params: SubmissionPageReq = {
      page_index: pagination.value.page - 1,
      page_size: pagination.value.pageSize,
    }
    if (props.topicId) {
      params.topic_id = props.topicId
    }
    if (submissionIdFilter.value) {
      params.submission_id = submissionIdFilter.value
    }
    if (auditStatusFilter.value !== undefined) {
      params.audit_status = auditStatusFilter.value
    }

    const resp = await getSubmissionPage(params)
    if (isSuccess(resp.code) && resp.data) {
      submissions.value = resp.data.records
      pagination.value.total = resp.data.total_row_count
      pagination.value.pageCount = resp.data.total_page
    } else {
      message.error(resp.msg || "加载投稿失败")
    }
  } catch {
    message.error("加载投稿失败")
  } finally {
    loading.value = false
  }
}

async function handleAudit(submission: Submission, status: number) {
  try {
    const resp = await updateSubmissionStatus(submission.id, status)
    if (isSuccess(resp.code)) {
      message.success(status === 2 ? "已设为纯良" : "已设为不宜展示")
      await loadSubmissions()
    } else {
      message.error(resp.msg || "操作失败")
    }
  } catch {
    message.error("操作失败")
  }
}

function handlePageChange(page: number) {
  pagination.value.page = page
  loadSubmissions()
}

function handlePageSizeChange(size: number) {
  pagination.value.pageSize = size
  pagination.value.page = 1
  loadSubmissions()
}

function filterByStatus(status: number | undefined) {
  auditStatusFilter.value = status
  pagination.value.page = 1
  loadSubmissions()
}

function handleSubmissionIdSearch() {
  pagination.value.page = 1
  loadSubmissions()
}

function clearSubmissionIdFilter() {
  submissionIdFilter.value = ""
  pagination.value.page = 1
  loadSubmissions()
}

function backToTopics() {
  router.push({ name: "treehole" })
}

watch(
  () => props.topicId,
  () => {
    pagination.value.page = 1
    loadSubmissions()
  },
)

onMounted(() => {
  loadSubmissions()
})
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <div class="submission-management">
      <div class="header">
        <div class="header-left">
          <NButton v-if="props.topicId" size="small" @click="backToTopics">
            ← 返回话题列表
          </NButton>
        </div>
        <h2 class="title">
          {{ topicId ? "话题投稿" : "全部投稿" }}
        </h2>
        <div class="filters">
          <div class="search-box">
            <NInput
              v-model:value="submissionIdFilter"
              size="small"
              placeholder="输入投稿ID搜索"
              style="width: 180px"
              @keyup.enter="handleSubmissionIdSearch"
            />
            <NButton size="small" type="primary" @click="handleSubmissionIdSearch"> 搜索 </NButton>
            <NButton v-if="submissionIdFilter" size="small" @click="clearSubmissionIdFilter">
              清除
            </NButton>
          </div>
          <NButton
            size="small"
            :type="auditStatusFilter === undefined ? 'primary' : 'default'"
            @click="filterByStatus(undefined)"
          >
            全部
          </NButton>
          <NButton
            size="small"
            :type="auditStatusFilter === 1 ? 'primary' : 'default'"
            @click="filterByStatus(1)"
          >
            待审核
          </NButton>
          <NButton
            size="small"
            :type="auditStatusFilter === 2 ? 'primary' : 'default'"
            @click="filterByStatus(2)"
          >
            纯良
          </NButton>
          <NButton
            size="small"
            :type="auditStatusFilter === 0 ? 'primary' : 'default'"
            @click="filterByStatus(0)"
          >
            不宜展示
          </NButton>
        </div>
      </div>

      <NDataTable
        :columns="columns"
        :data="submissions"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: Submission) => row.id"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </NConfigProvider>
</template>

<style scoped>
@reference "tailwindcss";

.submission-management {
  @apply p-4;
}

.header {
  @apply flex items-center justify-between mb-4;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  @apply flex items-center;
}

.title {
  @apply text-xl font-bold;
}

.filters {
  @apply flex gap-2 flex-wrap items-center;
}

.search-box {
  @apply flex gap-2;
}
</style>
