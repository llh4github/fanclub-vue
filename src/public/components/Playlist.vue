<template>
  <section id="playlist" class="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-card/30">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16 animate-fade-in">
        <div class="inline-block mb-4">
          <span
            class="text-sm tracking-[0.3em] text-[#DF7623] border border-[#DF7623]/30 px-4 py-1 clip-corner"
          >
            PLAYLIST
          </span>
        </div>
        <h2
          class="text-3xl sm:text-5xl mb-6 cursor-pointer hover:text-[#DF7623] transition-colors"
          @click="handleTitleClick"
        >
          歌单
        </h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">精选歌曲列表</p>
      </div>

      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="p-4 border-b border-border">
          <div class="flex justify-end">
            <n-input
              v-model:value="searchName"
              placeholder="搜索歌曲名称"
              size="small"
              class="mr-2"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <n-icon>
                  <Search />
                </n-icon>
              </template>
            </n-input>
            <n-button size="small" @click="handleSearch">搜索</n-button>
          </div>
        </div>
        <n-data-table
          :columns="columns"
          :data="songs"
          :loading="loading"
          :pagination="{
            page: pageIndex,
            pageSize: pageSize,
            itemCount: total,
            showSizePicker: false,
            showQuickJumper: true,
          }"
          @update:pagination="handlePaginationChange"
          :row-key="(row) => row.id"
          size="medium"
          bordered
        />
        <!-- 由于 Naive UI 的 DataTable 版本可能不支持 cell 插槽，这里使用列的 render 函数来处理 BV 号的链接 -->
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NDataTable, NInput, NButton, useMessage, NIcon } from 'naive-ui'
import { Search } from 'lucide-vue-next'
import { songService, type AnchorSongPageView } from '@/api/services/song'

const message = useMessage()

const loading = ref(false)
const songs = ref<AnchorSongPageView[]>([])
const total = ref(0)
const pageIndex = ref(1)
const pageSize = ref(10)
const searchName = ref('')

const columns = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    render: (_row: unknown, index: number) => {
      return index + 1
    },
  },
  {
    title: '歌曲名称',
    key: 'name',
    width: 300,
  },
  {
    title: '价格',
    key: 'price',
    width: 100,
    render(row: AnchorSongPageView) {
      return `${row.price} 元`
    },
  },
  {
    title: 'BV号',
    key: 'bv',
    width: 200,
  },
]

const fetchSongs = async () => {
  try {
    loading.value = true
    const response = await songService.getSongPageLiko({
      name: searchName.value || undefined,
      pageParam: {
        pageIndex: pageIndex.value,
        pageSize: pageSize.value,
      },
    })
    if (response.data) {
      songs.value = response.data.records
      total.value = response.data.totalRowCount
    }
  } catch (err) {
    console.error('获取歌曲列表失败:', err)
    message.error('获取歌曲列表失败，请重试')
  } finally {
    loading.value = false
  }
}

const handlePaginationChange = (pagination: any) => {
  pageIndex.value = pagination.page
  pageSize.value = pagination.pageSize
  fetchSongs()
}

const handleSearch = () => {
  pageIndex.value = 1
  fetchSongs()
}

// 处理标题点击事件，添加锚点功能
const handleTitleClick = () => {
  // 设置URL hash
  window.location.hash = 'playlist'

  // 滚动到当前section
  const section = document.getElementById('playlist')
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  fetchSongs()
})
</script>

<style scoped>
/* 自定义样式 */
:deep(.n-data-table) {
  background-color: transparent !important;
}

:deep(.n-data-table th) {
  background-color: rgba(10, 10, 15, 0.8) !important;
  color: #e5e5e5 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.n-data-table td) {
  background-color: rgba(10, 10, 15, 0.6) !important;
  color: #e5e5e5 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.n-data-table tr:hover td) {
  background-color: rgba(223, 118, 35, 0.3) !important;
  color: white !important;
}

:deep(.n-pagination) {
  background-color: rgba(10, 10, 15, 0.8) !important;
  color: #e5e5e5 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.n-pagination-item) {
  background-color: rgba(10, 10, 15, 0.8) !important;
  color: #e5e5e5 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.n-pagination-item:hover) {
  background-color: rgba(223, 118, 35, 0.2) !important;
}

:deep(.n-pagination-item--active) {
  background-color: rgba(223, 118, 35, 0.5) !important;
  border-color: #df7623 !important;
}

:deep(.n-input) {
  background-color: rgba(10, 10, 15, 0.8) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.n-input__input-el) {
  color: white !important;
}

:deep(.n-button) {
  background-color: rgba(223, 118, 35, 0.8) !important;
  color: white !important;
  border: 1px solid #df7623 !important;
}

:deep(.n-button:hover) {
  background-color: rgba(223, 118, 35, 1) !important;
}
</style>
