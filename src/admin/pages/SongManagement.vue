<template>
  <div class="song-management min-h-screen bg-background text-foreground p-4">
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-white">歌曲管理</h2>
      <div class="flex gap-2 items-center">
        <n-input
          v-model:value="searchName"
          placeholder="搜索歌曲名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">搜索</n-button>
        <n-button @click="handleReset">重置</n-button>
        <n-button
          type="error"
          :disabled="selectedRowKeys.length === 0"
          :loading="isDeleting"
          @click="handleBatchDelete"
        >
          批量删除{{ selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : '' }}
        </n-button>
        <n-button type="primary" @click="handleAdd"> 添加歌曲 </n-button>
      </div>
    </div>

    <div class="bg-card rounded-lg shadow-md p-6 flex-1 overflow-auto">
      <n-data-table
        :columns="columns"
        :data="songList"
        :pagination="pagination"
        :loading="isLoading"
        :row-key="(row: AnchorSongPageView) => row.id"
        :checked-row-keys="selectedRowKeys"
        @update:checked-row-keys="handleSelectionChange"
      />
    </div>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑歌曲' : '添加歌曲'"
      style="width: 500px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-form-item label="歌曲名称" path="name">
          <n-input v-model:value="form.name" placeholder="请输入歌曲名称" />
        </n-form-item>
        <n-form-item label="歌曲价格(元)" path="price">
          <n-input-number
            v-model:value="form.price"
            placeholder="请输入歌曲价格"
            :min="0"
            :max="10000"
            style="width: 100%"
          />

          <div class="flex gap-2 mt-2">
            <n-button
              v-for="price in quickPrices"
              :key="price"
              size="small"
              :type="form.price === price ? 'primary' : 'default'"
              @click="form.price = price"
            >
              {{ price }}
            </n-button>
          </div>
        </n-form-item>
        <n-form-item label="BV号" path="bv">
          <n-input v-model:value="form.bv" placeholder="请输入BV号" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="isSubmitting" @click="handleSubmit">确认</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showDeleteConfirm" preset="card" title="删除确认" style="width: 400px">
      <n-space vertical>
        <n-text>确定要删除选中的 {{ selectedRowKeys.length }} 首歌曲吗？</n-text>
        <n-text type="error">此操作不可恢复！</n-text>
      </n-space>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <n-button @click="showDeleteConfirm = false">取消</n-button>
          <n-button type="error" :loading="isDeleting" @click="handleConfirmDelete"
            >确认删除</n-button
          >
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts" name="SongManagement">
import { ref, reactive, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  useMessage,
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSpace,
  NText,
} from 'naive-ui'
import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
import { songService, type AnchorSongPageView } from '@/api/services/song'
import { type AnchorSongAddInput, type AnchorSongUpdateInput } from '@/api/services/song'
import { LIKO_INFO } from '@/common/constants/anchor'

const message = useMessage()
const router = useRouter()

const quickPrices = [0, 30, 50, 100, 138, 168]
const searchName = ref('')

const handleUnauthorized = () => {
  message.error('登录已失效，请重新登录')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  localStorage.removeItem('nickname')
  localStorage.removeItem('cryptoCache')
  router.push('/admin/login')
}

const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)

const songList = ref<AnchorSongPageView[]>([])
const selectedRowKeys = ref<DataTableRowKey[]>([])

const formRef = ref()

const form = reactive({
  id: 0,
  bid: LIKO_INFO.uid,
  name: '',
  price: 0,
  bv: '',
})

const rules = {
  name: [{ required: true, message: '请输入歌曲名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入歌曲价格', type: 'number' as const, trigger: 'blur' }],
  bv: [
    {
      validator: (rule: any, value: string) => {
        if (!value) {
          return true
        }
        if (!/^BV[A-Za-z0-9]{10}$/.test(value)) {
          return new Error('Bv号不合法')
        }
        return true
      },
      trigger: 'blur',
    },
  ],
}

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page
    fetchSongList()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    fetchSongList()
  },
})

const columns: DataTableColumns<AnchorSongPageView> = [
  {
    type: 'selection',
    disabled: () => false,
  },
  {
    title: '序号',
    key: 'index',
    width: 80,
    render: (_row, index) => {
      return index + 1
    },
  },
  {
    title: '歌曲名称',
    key: 'name',
    ellipsis: { tooltip: true },
  },
  {
    title: 'BV号',
    key: 'bv',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => {
      if (!row.bv) return ''
      return h(
        'a',
        {
          href: `https://www.bilibili.com/video/${row.bv}`,
          target: '_blank',
          class: 'text-blue-400 hover:text-blue-300 underline',
        },
        row.bv,
      )
    },
  },
  {
    title: '价格',
    key: 'price',
    width: 100,
  },
  {
    title: '创建时间',
    key: 'createdTime',
    width: 180,
    render: (row) => {
      return row.createdTime ? new Date(row.createdTime).toLocaleString('zh-CN') : '-'
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => {
      return h('div', { class: 'flex space-x-2' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleEdit(row),
          },
          { default: () => '编辑' },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleDelete([row.id]),
          },
          { default: () => '删除' },
        ),
      ])
    },
  },
]

onMounted(() => {
  fetchSongList()
})

const fetchSongList = async () => {
  isLoading.value = true
  try {
    const response = await songService.getSongPage({
      bid: undefined,
      name: searchName.value || undefined,
      pageParam: {
        pageIndex: pagination.page,
        pageSize: pagination.pageSize,
      },
    })
    if (response.data) {
      songList.value = response.data.records
      pagination.page = pagination.page
      pagination.pageSize = pagination.pageSize
    }
  } catch (error: any) {
    const errorCode = error.response?.data?.code || error.code
    if (errorCode === '401') {
      handleUnauthorized()
      return
    }
    const errorMessage =
      error.response?.data?.msg || error.msg || error.message || '获取歌曲列表失败'
    message.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchSongList()
}

const handleReset = () => {
  searchName.value = ''
  pagination.page = 1
  fetchSongList()
}

const handleAdd = () => {
  isEdit.value = false
  form.id = 0
  form.bid = LIKO_INFO.uid
  form.name = ''
  form.price = 0
  form.bv = ''
  showModal.value = true
}

const handleEdit = (row: AnchorSongPageView) => {
  isEdit.value = true
  form.id = row.id
  form.bid = row.bid
  form.name = row.name
  form.price = row.price
  form.bv = row.bv
  showModal.value = true
}

const handleDelete = (ids: number[]) => {
  selectedRowKeys.value = ids
  showDeleteConfirm.value = true
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的歌曲')
    return
  }
  showDeleteConfirm.value = true
}

const handleSelectionChange = (keys: DataTableRowKey[]) => {
  selectedRowKeys.value = keys as number[]
}

const handleSubmit = async () => {
  if (formRef.value) {
    await formRef.value.validate()
    isSubmitting.value = true
    try {
      if (isEdit.value) {
        const data: AnchorSongUpdateInput = {
          id: form.id,
          bid: form.bid,
          name: form.name,
          price: form.price,
          bv: form.bv,
        }
        await songService.updateSong(data)
        message.success('歌曲更新成功')
      } else {
        const data: AnchorSongAddInput = {
          bid: form.bid,
          name: form.name,
          price: form.price,
          bv: form.bv,
        }
        await songService.addSong(data)
        message.success('歌曲添加成功')
      }
      showModal.value = false
      fetchSongList()
    } catch (error: any) {
      const errorCode = error.response?.data?.code || error.code
      if (errorCode === '401') {
        handleUnauthorized()
        return
      }
      const errorMessage = error.response?.data?.msg || error.msg || error.message || '操作失败'
      message.error(errorMessage)
    } finally {
      isSubmitting.value = false
    }
  }
}

const handleConfirmDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的歌曲')
    return
  }
  isDeleting.value = true
  try {
    await songService.deleteSong({ ids: selectedRowKeys.value as number[] })
    message.success('删除成功')
    showDeleteConfirm.value = false
    selectedRowKeys.value = []
    fetchSongList()
  } catch (error: any) {
    const errorCode = error.response?.data?.code || error.code
    if (errorCode === '401') {
      handleUnauthorized()
      return
    }
    const errorMessage = error.response?.data?.msg || error.msg || error.message || '删除失败'
    message.error(errorMessage)
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.song-management {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
