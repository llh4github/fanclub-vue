<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue"
import IconMusic from "@/components/icons/IconMusic.vue"
import IconSearch from "@/components/icons/IconSearch.vue"
import IconClose from "@/components/icons/IconClose.vue"
import IconCopy from "@/components/icons/IconCopy.vue"
import IconChevronLeft from "@/components/icons/IconChevronLeft.vue"
import IconChevronRight from "@/components/icons/IconChevronRight.vue"
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
    <div class="section-header">
      <a href="#playlist" class="anchor-link" title="链接到歌单" aria-label="链接到歌单">
        <IconSearch :size="16" />
      </a>
      <div class="section-title-wrapper">
        <span class="title-icon">
          <IconMusic :size="24" />
        </span>
        <h2 class="section-title">歌单</h2>
      </div>
    </div>

    <div class="playlist-container">
      <!-- Video player -->
      <div v-if="selectedSong && videoUrl" class="video-wrapper">
        <div class="video-header">
          <span class="video-title">{{ selectedSong.name }}</span>
          <button class="video-close" @click="closeVideo" title="关闭视频" aria-label="关闭视频">
            <IconClose :size="16" />
          </button>
        </div>
        <div class="video-player">
          <iframe :src="videoUrl" frameborder="0" allowfullscreen scrolling="no"></iframe>
        </div>
      </div>

      <!-- Search bar -->
      <div class="search-bar">
        <span class="search-icon">
          <IconSearch :size="16" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索歌名..."
          @keyup.enter="onSearch"
          aria-label="搜索歌名"
        />
        <button v-if="searchQuery" class="search-clear" @click="clearSearch" aria-label="清除搜索">
          <IconClose :size="14" />
        </button>
      </div>

      <!-- Track list -->
      <div class="track-list">
        <div v-if="loading" class="empty-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="pagedList.length === 0" class="empty-state">
          <IconSearch :size="32" class="empty-icon" />
          <span>没有找到匹配的歌曲</span>
        </div>
        <div
          v-for="(track, index) in pagedList"
          :key="track.bv"
          class="track-item"
          :class="{ active: selectedSong?.bv === track.bv }"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="selectSong(track)"
        >
          <div class="track-num">{{ String(index + 1 + (currentPage - 1) * pageSize).padStart(2, "0") }}</div>
          <div class="track-info">
            <div class="track-title">{{ track.name }}</div>
            <div class="track-meta">
              <span v-if="track.bv" class="track-bv">{{ track.bv }}</span>
              <span class="track-price">{{ track.price }}元</span>
            </div>
          </div>
          <button class="copy-btn" @click.stop="copySongName(track.name)" title="复制歌名" aria-label="复制歌名">
            <IconCopy :size="14" />
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          title="上一页"
          aria-label="上一页"
        >
          <IconChevronLeft :size="18" />
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
          aria-label="下一页"
        >
          <IconChevronRight :size="18" />
        </button>
      </div>

      <!-- Footer -->
      <div class="playlist-footer">
        <span class="footer-text">
          <span class="footer-line"></span>
          <span>歌单 · 共 {{ filteredList.length }} 首</span>
          <span class="footer-line"></span>
        </span>
      </div>
    </div>

    <!-- Corner decorations -->
    <div class="corner-deco top-left"></div>
    <div class="corner-deco top-right"></div>
    <div class="corner-deco bottom-left"></div>
    <div class="corner-deco bottom-right"></div>
  </section>
</template>

<style scoped>
.playlist-section {
  padding: 5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  scroll-margin-top: 2rem;
  position: relative;
}

.playlist-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.anchor-link {
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  text-decoration: none;
  color: rgba(0, 245, 255, 0.3);
  transition: all 0.3s ease;
  opacity: 0;
}

.section-header:hover .anchor-link {
  opacity: 1;
  color: #00f5ff;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.title-icon {
  display: flex;
  align-items: center;
  color: #00f5ff;
  animation: icon-bounce 2s ease-in-out infinite;
}

@keyframes icon-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.section-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0;
  color: #fff;
  text-shadow:
    0 0 20px rgba(0, 245, 255, 0.5),
    2px 2px 0 #ff6b35;
  letter-spacing: 4px;
}

/* Playlist Container */
.playlist-container {
  width: 100%;
  max-width: 900px;
  background: rgba(10, 8, 18, 0.9);
  border: 1px solid rgba(0, 245, 255, 0.2);
  padding: 1.5rem;
  position: relative;
}

/* Corner decorations */
.corner-deco {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: rgba(255, 107, 53, 0.5);
  border-style: solid;
  transition: all 0.3s ease;
}

.corner-deco.top-left {
  top: -1px;
  left: -1px;
  border-width: 3px 0 0 3px;
}

.corner-deco.top-right {
  top: -1px;
  right: -1px;
  border-width: 3px 3px 0 0;
}

.corner-deco.bottom-left {
  bottom: -1px;
  left: -1px;
  border-width: 0 0 3px 3px;
}

.corner-deco.bottom-right {
  bottom: -1px;
  right: -1px;
  border-width: 0 3px 3px 0;
}

.playlist-container:hover .corner-deco {
  border-color: #ff6b35;
}

/* Video wrapper */
.video-wrapper {
  margin-bottom: 1rem;
}

.video-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-bottom: none;
}

.video-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-close {
  background: transparent;
  border: 1px solid rgba(255, 107, 53, 0.5);
  color: rgba(255, 107, 53, 0.7);
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.video-close:hover {
  background: rgba(255, 107, 53, 0.2);
  border-color: #ff6b35;
  color: #ff6b35;
}

.video-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-top: none;
  overflow: hidden;
}

.video-player iframe {
  width: 100%;
  height: 100%;
}

/* Search bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  background: rgba(0, 245, 255, 0.03);
  border: 1px solid rgba(0, 245, 255, 0.2);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  border-color: #00f5ff;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.15);
}

.search-icon {
  color: rgba(0, 245, 255, 0.4);
  display: flex;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: rgba(0, 245, 255, 0.3);
}

.search-clear {
  background: transparent;
  border: none;
  color: rgba(255, 107, 53, 0.5);
  cursor: pointer;
  padding: 0.3rem;
  transition: all 0.3s ease;
}

.search-clear:hover {
  color: #ff6b35;
}

/* Track list */
.track-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: 3rem;
  color: rgba(0, 245, 255, 0.4);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(0, 245, 255, 0.2);
  border-top-color: #00f5ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  opacity: 0.5;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  background: rgba(0, 245, 255, 0.02);
  border: 1px solid transparent;
  cursor: pointer;
  animation: track-fade-in 0.4s ease both;
  transition: all 0.3s ease;
}

@keyframes track-fade-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.track-item:hover {
  background: rgba(0, 245, 255, 0.08);
  border-color: rgba(0, 245, 255, 0.2);
}

.track-item.active {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.4);
}

.track-item.active .track-num {
  color: #ff6b35;
}

.track-num {
  min-width: 28px;
  text-align: center;
  font-size: 0.75rem;
  font-family: monospace;
  color: rgba(139, 92, 246, 0.5);
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-item.active .track-title {
  text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
}

.track-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.track-bv {
  font-size: 0.7rem;
  color: rgba(255, 107, 53, 0.6);
  font-family: monospace;
}

.track-price {
  font-size: 0.75rem;
  color: rgba(139, 92, 246, 0.7);
}

.copy-btn {
  background: transparent;
  border: 1px solid rgba(0, 245, 255, 0.3);
  color: rgba(0, 245, 255, 0.5);
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.copy-btn:hover {
  background: rgba(0, 245, 255, 0.1);
  border-color: #00f5ff;
  color: #00f5ff;
  opacity: 1;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 1.5rem;
}

.page-btn {
  background: transparent;
  border: 1px solid rgba(0, 245, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  width: 36px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #00f5ff;
  color: #00f5ff;
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
}

.page-btn.active {
  background: rgba(255, 107, 53, 0.15);
  border-color: #ff6b35;
  color: #ff6b35;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.page-ellipsis {
  color: rgba(139, 92, 246, 0.4);
  padding: 0 0.5rem;
}

/* Footer */
.playlist-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
  text-align: center;
}

.footer-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: rgba(0, 245, 255, 0.4);
  font-size: 0.75rem;
}

.footer-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.3), transparent);
}

/* Responsive */
@media (max-width: 768px) {
  .playlist-section {
    padding: 3rem 1rem;
  }

  .playlist-container {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>