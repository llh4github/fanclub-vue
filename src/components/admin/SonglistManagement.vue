<script setup lang="ts">
import { ref, onMounted, h } from "vue"
import {
  NCard,
  NInput,
  NButton,
  NIcon,
  NDataTable,
  NPopconfirm,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  useMessage,
  NSpace,
} from "naive-ui"
import type { DataTableColumns } from "naive-ui"
import {
  SearchOutline,
  CloseOutline,
  AddOutline,
  TrashOutline,
  CreateOutline,
  MusicalNotesOutline,
} from "@vicons/ionicons5"
import { getAdminSongPage, createSong, updateSong, deleteSong, type AnchorSong } from "@/api/song"
import { isSuccess } from "@/api/types"
import { Liko } from "@/config"
import dayjs from "dayjs"

type SongRecord = AnchorSong

const message = useMessage()
const searchQuery = ref("")
const isLoading = ref(false)
const songs = ref<SongRecord[]>([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  pageCount: 1,
  total: 0,
  pageSizes: [10, 20, 50],
  showSizePicker: true,
  prefix: ({ itemCount }: { itemCount: number | undefined }) => `共 ${itemCount} 条`,
})

const showAddModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const editingSong = ref<SongRecord | null>(null)

const addFormData = ref({
  name: "",
  bv: "",
  price: 0,
})

const editFormData = ref({
  id: "",
  name: "",
  bv: "",
  price: 0,
})

const columns: DataTableColumns<SongRecord> = [
  {
    title: "序号",
    key: "index",
    width: 70,
    render: (_data, index) => {
      return (pagination.value.page - 1) * pagination.value.pageSize + index + 1
    },
  },
  {
    title: "歌曲名称",
    key: "name",
    ellipsis: { tooltip: true },
  },
  {
    title: "BV号",
    key: "bv",
    width: 180,
    render: (row) => {
      if (!row.bv) return "-"
      return h(
        "a",
        {
          href: `https://www.bilibili.com/video/${row.bv}`,
          target: "_blank",
          style: "color: #ff9e5e; text-decoration: none;",
        },
        row.bv,
      )
    },
  },
  {
    title: "价格(元)",
    key: "price",
    width: 100,
    align: "center",
  },
  {
    title: "创建时间",
    key: "created_time",
    width: 180,
    render: (row) => {
      return dayjs(row.created_time).format("YYYY-MM-DD HH:mm")
    },
  },
  {
    title: "更新时间",
    key: "updated_time",
    width: 180,
    render: (row) => {
      return dayjs(row.updated_time).format("YYYY-MM-DD HH:mm")
    },
  },
  {
    title: "操作",
    key: "actions",
    width: 120,
    align: "center",
    render(row) {
      const actions: ReturnType<typeof h>[] = []
      actions.push(
        h(
          NButton,
          {
            size: "small",
            quaternary: true,
            onClick: () => openEditModal(row),
          },
          {
            icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
          },
        ),
      )
      actions.push(
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row),
          },
          {
            trigger: () =>
              h(
                NButton,
                { size: "small", quaternary: true, type: "error" },
                {
                  icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
                },
              ),
            default: () => "确认删除这首歌曲？",
          },
        ),
      )
      return h(NSpace, { size: "small" }, { default: () => actions })
    },
  },
]

async function loadSongs() {
  isLoading.value = true
  try {
    const resp = await getAdminSongPage({
      bid: Liko.BID,
      name: searchQuery.value || undefined,
      pageIndex: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })

    if (isSuccess(resp.code) && resp.data) {
      songs.value = resp.data.records
      pagination.value.total = resp.data.total_row_count
      pagination.value.pageCount = resp.data.total_page
    } else {
      message.error(resp.msg || "加载失败")
    }
  } catch {
    message.error("加载歌单失败，请检查后端服务")
  } finally {
    isLoading.value = false
  }
}

function handleSearch() {
  pagination.value.page = 1
  loadSongs()
}

function clearSearch() {
  searchQuery.value = ""
  handleSearch()
}

function openAddModal() {
  addFormData.value = { name: "", bv: "", price: 0 }
  showAddModal.value = true
}

async function handleAdd() {
  if (!addFormData.value.name.trim()) {
    message.warning("请输入歌曲名称")
    return
  }

  isSubmitting.value = true
  try {
    const resp = await createSong({
      bid: Liko.BID,
      name: addFormData.value.name.trim(),
      bv: addFormData.value.bv.trim() || undefined,
      price: addFormData.value.price,
    })

    if (isSuccess(resp.code)) {
      message.success("添加成功")
      showAddModal.value = false
      loadSongs()
    } else {
      message.error(resp.msg || "添加失败")
    }
  } catch {
    message.error("添加失败，请检查后端服务")
  } finally {
    isSubmitting.value = false
  }
}

function openEditModal(row: SongRecord) {
  editingSong.value = row
  editFormData.value = {
    id: row.id,
    name: row.name,
    bv: row.bv,
    price: row.price,
  }
  showEditModal.value = true
}

async function handleUpdate() {
  if (!editFormData.value.name.trim()) {
    message.warning("请输入歌曲名称")
    return
  }

  isSubmitting.value = true
  try {
    const resp = await updateSong({
      id: editFormData.value.id,
      bid: Liko.BID,
      name: editFormData.value.name.trim(),
      bv: editFormData.value.bv.trim() || "",
      price: editFormData.value.price,
    })

    if (isSuccess(resp.code)) {
      message.success("更新成功")
      showEditModal.value = false
      loadSongs()
    } else {
      message.error(resp.msg || "更新失败")
    }
  } catch {
    message.error("更新失败，请检查后端服务")
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete(row: SongRecord) {
  try {
    const resp = await deleteSong([row.id])
    if (isSuccess(resp.code)) {
      message.success("删除成功")
      loadSongs()
    } else {
      message.error(resp.msg || "删除失败")
    }
  } catch {
    message.error("删除失败，请检查后端服务")
  }
}

function handlePageChange(page: number) {
  pagination.value.page = page
  loadSongs()
}

function handlePageSizeChange(pageSize: number) {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  loadSongs()
}

onMounted(() => {
  loadSongs()
})
</script>

<template>
  <div class="playlist-management">
    <NCard class="management-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <NIcon size="24">
              <MusicalNotesOutline />
            </NIcon>
            <span>歌单管理</span>
          </div>
          <NButton type="primary" class="add-btn" @click="openAddModal">
            <template #icon>
              <NIcon>
                <AddOutline />
              </NIcon>
            </template>
            添加歌曲
          </NButton>
        </div>
      </template>

      <div class="search-bar">
        <NInput
          v-model:value="searchQuery"
          placeholder="搜索歌曲名称..."
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <NIcon>
              <SearchOutline />
            </NIcon>
          </template>
          <template #suffix>
            <button v-if="searchQuery" type="button" class="clear-btn" @click="clearSearch">
              <NIcon>
                <CloseOutline />
              </NIcon>
            </button>
          </template>
        </NInput>
        <NButton type="primary" @click="handleSearch" :loading="isLoading"> 搜索 </NButton>
      </div>

      <NDataTable
        :columns="columns"
        :data="songs"
        :loading="isLoading"
        :pagination="pagination"
        :row-key="(row: SongRecord) => String(row.id)"
        remote
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        striped
      />

      <div v-if="!isLoading && songs.length === 0" class="empty-state">
        <NIcon size="48">
          <MusicalNotesOutline />
        </NIcon>
        <p>暂无歌曲数据</p>
      </div>
    </NCard>

    <NModal v-model:show="showAddModal" preset="card" title="添加歌曲" :style="{ width: '450px' }">
      <NForm label-placement="top">
        <NFormItem label="歌曲名称" required>
          <NInput v-model:value="addFormData.name" placeholder="请输入歌曲名称" />
        </NFormItem>
        <NFormItem label="BV号">
          <NInput v-model:value="addFormData.bv" placeholder="请输入BV号（可选）" />
        </NFormItem>
        <NFormItem label="价格（元）">
          <NInputNumber
            v-model:value="addFormData.price"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
          <div class="price-presets">
            <NButton size="tiny" @click="addFormData.price = 0">0</NButton>
            <NButton size="tiny" @click="addFormData.price = 30">30</NButton>
            <NButton size="tiny" @click="addFormData.price = 50">50</NButton>
            <NButton size="tiny" @click="addFormData.price = 100">100</NButton>
            <NButton size="tiny" @click="addFormData.price = 138">138</NButton>
            <NButton size="tiny" @click="addFormData.price = 168">168</NButton>
          </div>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showAddModal = false">取消</NButton>
          <NButton type="primary" :loading="isSubmitting" @click="handleAdd">确定</NButton>
        </NSpace>
      </template>
    </NModal>

    <NModal v-model:show="showEditModal" preset="card" title="编辑歌曲" :style="{ width: '450px' }">
      <NForm label-placement="top">
        <NFormItem label="歌曲名称" required>
          <NInput v-model:value="editFormData.name" placeholder="请输入歌曲名称" />
        </NFormItem>
        <NFormItem label="BV号">
          <NInput v-model:value="editFormData.bv" placeholder="请输入BV号（可选）" />
        </NFormItem>
        <NFormItem label="价格（元）">
          <NInputNumber
            v-model:value="editFormData.price"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
          <div class="price-presets">
            <NButton size="tiny" @click="editFormData.price = 0">0</NButton>
            <NButton size="tiny" @click="editFormData.price = 30">30</NButton>
            <NButton size="tiny" @click="editFormData.price = 50">50</NButton>
            <NButton size="tiny" @click="editFormData.price = 100">100</NButton>
            <NButton size="tiny" @click="editFormData.price = 138">138</NButton>
            <NButton size="tiny" @click="editFormData.price = 168">168</NButton>
          </div>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showEditModal = false">取消</NButton>
          <NButton type="primary" :loading="isSubmitting" @click="handleUpdate">确定</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.playlist-management {
  padding: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.management-card {
  background: rgba(26, 16, 24, 0.8);
  border: 1px solid rgba(223, 118, 35, 0.15);
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffe4cc;
}

.add-btn {
  background: linear-gradient(135deg, #df7623 0%, #ff9e5e 100%);
  border: none;
}

.search-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.search-bar :deep(.n-input) {
  --n-border: 1px solid rgba(223, 118, 35, 0.25);
  --n-border-hover: 1px solid rgba(223, 118, 35, 0.4);
  --n-border-focus: 1px solid #ff9e5e;
  --n-color: rgba(26, 16, 24, 0.8);
  --n-color-focus: rgba(26, 16, 24, 0.9);
  --n-text-color: #ffe4cc;
  --n-placeholder-color: rgba(255, 228, 204, 0.4);
  --n-caret-color: #ff9e5e;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: rgba(255, 228, 204, 0.5);
  cursor: pointer;
  transition: color 0.2s ease;
}

.clear-btn:hover {
  color: #ff9e5e;
}

.price-presets {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.price-presets .n-button {
  background: rgba(223, 118, 35, 0.15);
  border: 1px solid rgba(223, 118, 35, 0.3);
  color: #ff9e5e;
}

.price-presets .n-button:hover {
  background: rgba(223, 118, 35, 0.25);
  border-color: rgba(223, 118, 35, 0.5);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: rgba(255, 228, 204, 0.4);
  gap: 1rem;
}

.empty-state p {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .playlist-management {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .search-bar {
    flex-direction: column;
  }
}
</style>
