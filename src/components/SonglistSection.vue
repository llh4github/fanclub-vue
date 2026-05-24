<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue"
import { VGlass } from "@daisigu/vue-liquid-glass"
import { getSongPage, type AnchorSongSimple } from "@/api"
import { Liko } from "@/config"
import { isSuccess } from "@/api/types"
import { useMessage } from "naive-ui"

const message = useMessage()
const sectionRef = ref<HTMLElement>()
const isVisible = ref(false)
const searchQuery = ref("")
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const totalRecords = ref(0)
const selectedSong = ref<AnchorSongSimple | null>(null)

const playlist = ref<AnchorSongSimple[]>([])

const filteredList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return playlist.value
  return playlist.value.filter((t) => t.name.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / pageSize)))

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const videoUrl = computed(() => {
  if (!selectedSong.value?.bv) return null
  return `https://player.bilibili.com/player.html?bvid=${selectedSong.value.bv}&high_quality=1&autoplay=0&danmaku=0`
})

async function fetchPlaylist() {
  loading.value = true
  try {
    const res = await getSongPage({ bid: Liko.BID, pageSize: 100, pageIndex: 1 })
    if (isSuccess(res.code) && res.data) {
      playlist.value = res.data.records
      totalRecords.value = res.data.total_row_count
    }
  } catch (err) {
    console.error("Failed to fetch playlist:", err)
  } finally {
    loading.value = false
  }
}

function selectSong(song: AnchorSongSimple) {
  selectedSong.value = song
}

function closeVideo() {
  selectedSong.value = null
}

function copySongName(name: string) {
  navigator.clipboard
    .writeText(`点歌 ${name}`)
    .then(() => {
      message.success(`已复制：点歌 ${name}`)
    })
    .catch(() => {
      message.error("复制失败")
    })
}

function onSearch() {
  currentPage.value = 1
}

function clearSearch() {
  searchQuery.value = ""
  onSearch()
}

function goToPage(page: number) {
  currentPage.value = page
}

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: number[] = []
  pages.push(1)
  if (current > 3) pages.push(-1)
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push(-1)
  pages.push(total)
  return pages
})

let observer: IntersectionObserver | null = null

onMounted(async () => {
  await fetchPlaylist()
  if (!sectionRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
        }
      })
    },
    { threshold: 0.1 },
  )
  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <section ref="sectionRef" id="playlist" class="playlist-section" :class="{ visible: isVisible }">
    <h2 class="section-title">
      <a href="#playlist" class="anchor-link" title="链接到歌单">
        <span class="anchor-icon">🔗</span>
      </a>
      <span class="title-icon">🎵</span>
      歌单
    </h2>

    <VGlass class="playlist-card" :blur="10" :scale="30" :base-frequency="0.015" :radius="20">
      <div v-if="selectedSong && videoUrl" class="video-wrapper">
        <div class="video-header">
          <span class="video-title">{{ selectedSong.name }}</span>
          <button class="video-close" @click="closeVideo" title="关闭视频">✕</button>
        </div>
        <div class="video-player">
          <iframe :src="videoUrl" frameborder="0" allowfullscreen scrolling="no"></iframe>
        </div>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索歌名..."
          @keyup.enter="onSearch"
        />
        <button v-if="searchQuery" class="search-clear" @click="clearSearch">✕</button>
      </div>

      <div class="track-list">
        <div v-if="loading" class="empty-state">
          <span>🎵</span>
          <span>加载中...</span>
        </div>
        <div v-else-if="pagedList.length === 0" class="empty-state">
          <span>🔍</span>
          <span>没有找到匹配的歌曲</span>
        </div>
        <div
          v-for="(track, index) in pagedList"
          :key="track.bv"
          class="track-item"
          :class="{ active: selectedSong?.bv === track.bv }"
          :style="{ animationDelay: `${index * 0.06}s` }"
          @click="selectSong(track)"
        >
          <div class="track-num">
            {{ String(index + 1 + (currentPage - 1) * pageSize).padStart(2, "0") }}
          </div>
          <div class="track-info">
            <div class="track-title">{{ track.name }}</div>
            <div class="track-meta">
              <span v-if="track.bv" class="track-bv">{{ track.bv }}</span>
              <span class="track-price">{{ track.price }}元</span>
            </div>
          </div>
          <button class="copy-btn" @click.stop="copySongName(track.name)" title="复制歌名">
            📋
          </button>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          title="上一页"
        >
          ‹
        </button>
        <template v-for="p in pageNumbers" :key="p">
          <span v-if="p === -1" class="page-ellipsis">…</span>
          <button
            v-else
            class="page-btn"
            :class="{ active: p === currentPage }"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
        </template>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          title="下一页"
        >
          ›
        </button>
      </div>

      <div class="playlist-footer">
        <span>🎶 莉蔻的私人收藏 · 共 {{ filteredList.length }} 首</span>
      </div>
    </VGlass>
  </section>
</template>

<style scoped>
.playlist-section {
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  scroll-margin-top: 2rem;
}

.playlist-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-title {
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.anchor-link {
  text-decoration: none;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 0.8rem;
}

.section-title:hover .anchor-link {
  opacity: 0.6;
}

.anchor-link:hover {
  opacity: 1 !important;
}

.anchor-icon {
  font-size: 0.9rem;
}

.title-icon {
  font-size: 1.5rem;
  animation: musicNote 3s ease-in-out infinite;
}

@keyframes musicNote {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }

  25% {
    transform: rotate(-10deg) scale(1.1);
  }

  75% {
    transform: rotate(10deg) scale(1.1);
  }
}

.playlist-card {
  width: 100%;
  max-width: 700px;
  padding: 1.5rem;
}

.video-wrapper {
  margin-bottom: 1rem;
}

.video-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.video-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-close {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: auto;
}

.video-close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

.video-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;
}

.video-player iframe {
  width: 100%;
  height: 100%;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.song-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.bv-tag {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.bv-tag a {
  color: inherit;
  text-decoration: none;
}

.bv-tag a:hover {
  text-decoration: underline;
}

.price-tag {
  font-size: 0.85rem;
  color: rgba(139, 92, 246, 0.6);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.5rem 0.8rem;
  margin-bottom: 0.8rem;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.search-bar:focus-within {
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow:
    0 0 0 3px rgba(102, 126, 234, 0.15),
    0 0 20px rgba(102, 126, 234, 0.2);
}

.search-icon {
  font-size: 0.85rem;
  opacity: 0.5;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.85rem;
  font-family: inherit;
}

.search-input::placeholder {
  color: rgba(102, 126, 234, 0.4);
}

.search-clear {
  background: none;
  border: none;
  color: rgba(139, 92, 246, 0.5);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.search-clear:hover {
  color: rgba(102, 126, 234, 0.9);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 0;
  color: rgba(139, 92, 246, 0.4);
  font-size: 0.85rem;
}

.empty-state span:first-child {
  font-size: 1.5rem;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 200px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  animation: fadeInUp 0.4s ease both;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
}

.track-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.15);
}

.track-item.active {
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 0 25px rgba(102, 126, 234, 0.2);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.track-num {
  min-width: 28px;
  text-align: center;
  font-size: 0.75rem;
  color: rgba(139, 92, 246, 0.4);
  font-family: monospace;
}

.track-item.active .track-num {
  color: #667eea;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-item.active .track-title {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.track-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.track-bv {
  font-size: 0.7rem;
  color: rgba(139, 92, 246, 0.5);
}

.track-price {
  font-size: 0.75rem;
  color: rgba(102, 126, 234, 0.7);
}

.copy-btn {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: rgba(102, 126, 234, 0.8);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.copy-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.4);
  opacity: 1;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 1rem;
}

.page-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  font-family: inherit;
}

.page-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.35);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.25);
}

.page-btn.active {
  background: rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.5);
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.page-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.page-ellipsis {
  color: rgba(139, 92, 246, 0.3);
  font-size: 0.85rem;
  padding: 0.5rem;
  user-select: none;
}

.playlist-footer {
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  font-size: 0.75rem;
  color: rgba(139, 92, 246, 0.4);
}

@media (max-width: 768px) {
  .playlist-section {
    padding: 3rem 1rem;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1.4rem;
  }

  .playlist-card {
    padding: 1rem;
    border-radius: 16px;
  }

  .selected-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .track-title {
    font-size: 0.85rem;
  }
}
</style>
