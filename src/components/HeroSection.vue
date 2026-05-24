<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { VGlass } from "@daisigu/vue-liquid-glass"
import { getLatestFollowerNum, getTopicCount } from "@/api"
import { getLatestLiveRecord, LiveRecordStatus, type LatestLiveRecord } from "@/api/schedule"
import { Liko } from "@/config"
import { isSuccess } from "@/api/types"
import avatar_a from "@/assets/avatar/avatar_a.webp"
import avatar_ku from "@/assets/avatar/avatar_ku.webp"
import avatar_xiao from "@/assets/avatar/avatar_xiao.webp"
import avatar_04 from "@/assets/avatar/avatar_04.jpg"

const router = useRouter()

const debutDays = computed(() => {
  const debut = new Date(Liko.DebutDate)
  const now = new Date()
  const diff = now.getTime() - debut.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
})

const isLoaded = ref(false)
const fansCount = ref("0")
const isLive = ref(false)
const latestLiveRecord = ref<LatestLiveRecord | null>(null)
const showContributeBtn = ref(false)

const avatarList = [avatar_a, avatar_ku, avatar_xiao, avatar_04]
const randomAvatar = computed(() => {
  const index = Math.floor(Math.random() * avatarList.length)
  return avatarList[index]
})

const stats = [
  { id: "fans", icon: "👥", label: "粉丝", value: computed(() => fansCount.value) },
  { id: "streams", icon: "📺", label: "出道天数", value: computed(() => `${debutDays.value}天`) },
  { id: "birthday", icon: "🎂", label: "生日", value: "8月3日" },
]

function openBiliSpace() {
  window.open(`https://space.bilibili.com/${Liko.BID}`, "_blank")
}

function goContribute() {
  router.push("/contribute")
}

function formatLiveTime(timeStr: string): string {
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
}

function enterLiveRoom() {
  if (isLive.value) {
    window.open(`https://live.bilibili.com/${Liko.RoomID}`, "_blank")
  } else if (latestLiveRecord.value?.live_time) {
    const liveTime = new Date(latestLiveRecord.value.live_time)
    const formattedTime = `${liveTime.getMonth() + 1}月${liveTime.getDate()}日 ${liveTime.getHours()}:${String(liveTime.getMinutes()).padStart(2, "0")}`
    alert(`上次直播时间：${formattedTime}`)
  } else {
    alert("暂无直播记录")
  }
}

const quotes = [
  { text: "在胡萝卜星云，我们用胡萝卜暗器打架，地球人太弱了！", source: "母星回忆录" },
  { text: "杀手不需要同情……但外星兔子可以有粉丝群！", source: "地球观察日记" },
  { text: "今天的任务进度：收集了3个地球粉丝，距离征服地球还差999997个！", source: "每日任务报告" },
  { text: "警告：地球空气含氧量过高，可能导致兔子心情变好。", source: "环境适应记录" },
  { text: "胡萝卜飞镖技能冷却中……顺便唱首歌等一下。", source: "直播间隙" },
  { text: "地球的娱乐系统很发达，或许可以加入直播业完成母星任务。", source: "战略规划书" },
]
const quoteIndex = ref(0)
const displayQuote = ref("")
const isTyping = ref(false)
const showSource = ref(false)
const songIcon = ref("🎵")
const songLabel = ref("歌势")
const songIconType = ref("mic")
let quoteTimer: ReturnType<typeof setTimeout> | null = null

function typeQuote(text: string, onDone?: () => void) {
  isTyping.value = true
  displayQuote.value = ""
  let i = 0
  function next() {
    if (i < text.length) {
      displayQuote.value += text[i]
      i++
      const ch = text[i - 1]
      let delay = 65
      if ("，。！？、；：".includes(ch)) delay = 200
      else if ("…—".includes(ch)) delay = 120
      quoteTimer = setTimeout(next, delay)
    } else {
      isTyping.value = false
      onDone?.()
    }
  }
  next()
}

function eraseQuote(onDone?: () => void) {
  const text = displayQuote.value
  let i = text.length
  function next() {
    if (i > 0) {
      i--
      displayQuote.value = text.slice(0, i)
      quoteTimer = setTimeout(next, 25)
    } else {
      onDone?.()
    }
  }
  next()
}

function cycleQuote() {
  showSource.value = false
  const q = quotes[quoteIndex.value]
  typeQuote(q.text, () => {
    setTimeout(() => {
      showSource.value = true
    }, 300)
    quoteTimer = setTimeout(() => {
      showSource.value = false
      setTimeout(() => {
        eraseQuote(() => {
          quoteIndex.value = (quoteIndex.value + 1) % quotes.length
          setTimeout(cycleQuote, 400)
        })
      }, 400)
    }, 10000)
  })
}

const latestFansNum = ref(0)

async function fetchFollowerData() {
  try {
    const [latestRes, liveRes, topicCountRes] = await Promise.all([
      getLatestFollowerNum(Liko.BID),
      getLatestLiveRecord(Liko.RoomID),
      getTopicCount(Liko.BID),
    ])

    if (isSuccess(latestRes.code) && latestRes.data) {
      latestFansNum.value = latestRes.data.num
    }

    if (isSuccess(liveRes.code) && liveRes.data) {
      isLive.value = liveRes.data.live_status === LiveRecordStatus.LIVING
      latestLiveRecord.value = liveRes.data
    }

    if (isSuccess(topicCountRes.code) && topicCountRes.data) {
      showContributeBtn.value = topicCountRes.data > 0
    }
  } catch (error) {
    console.error("Failed to fetch follower data:", error)
  }
}

function animateFansCount() {
  const target = latestFansNum.value
  if (target === 0) return

  const duration = 2000
  const start = performance.now()
  function animateCount(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(target * eased)
    fansCount.value =
      current >= 10000 ? (current / 10000).toFixed(1) + "万" : current.toLocaleString()
    if (progress < 1) requestAnimationFrame(animateCount)
  }
  requestAnimationFrame(animateCount)
}

onMounted(async () => {
  setTimeout(() => {
    isLoaded.value = true
  }, 300)

  await fetchFollowerData()
  setTimeout(animateFansCount, 800)

  setTimeout(cycleQuote, 1200)

  setTimeout(() => {
    songIcon.value = "💬"
    songLabel.value = "杂谈势"
    songIconType.value = "bubble"
  }, 3000)
})

onBeforeUnmount(() => {
  if (quoteTimer) {
    clearTimeout(quoteTimer)
    quoteTimer = null
  }
})
</script>

<template>
  <section id="home" class="hero-section" :class="{ loaded: isLoaded }">
    <div class="hero-content">
      <div class="avatar-container">
        <div class="avatar-wrapper" :class="{ live: isLive }">
          <div class="avatar-glow"></div>
          <div v-if="isLive" class="live-ring"></div>
          <div v-if="isLive" class="live-ring"></div>
          <div v-if="isLive" class="live-ring"></div>
          <img :src="randomAvatar" alt="莉蔻Liko" class="avatar" />
          <div v-if="isLive" class="live-indicator">
            <div class="live-indicator-inner">
              <span class="live-dot"></span>
              <span class="live-text">直播中</span>
            </div>
          </div>
        </div>
      </div>

      <h1
        class="hero-title text-[2.5rem] font-bold text-primary mb-2 md:text-[2rem] sm:text-[1.6rem]"
      >
        莉蔻Liko
      </h1>

      <div class="hero-subtitle flex gap-2 justify-center flex-wrap">
        <span class="glass-badge">
          <div class="badge-shine"></div>
          <span class="relative z-10 flex items-center gap-1">
            <img
              src="@/assets/icons/circle-v.svg"
              alt="V"
              class="w-4 h-4"
              style="filter: invert(73%) sepia(98%) saturate(200%) hue-rotate(220deg)"
            />
            VR所属
          </span>
        </span>
        <span class="glass-badge">
          <div class="badge-shine"></div>
          <span class="relative z-10 flex items-center gap-1">
            <img
              src="@/assets/icons/woman-head.svg"
              alt="虚拟主播"
              class="w-4 h-4"
              style="filter: invert(73%) sepia(98%) saturate(200%) hue-rotate(220deg)"
            />
            虚拟主播
          </span>
        </span>
        <span class="glass-badge">
          <div class="badge-shine"></div>
          <span class="relative z-10 flex items-center gap-1">
            <img
              v-if="songIconType === 'mic'"
              src="@/assets/icons/microphone-alt.svg"
              alt="歌势"
              class="w-4 h-4"
              style="filter: invert(73%) sepia(98%) saturate(200%) hue-rotate(220deg)"
            />
            <img
              v-else
              src="@/assets/icons/bubble-discussion.svg"
              alt="杂谈"
              class="w-4 h-4"
              style="filter: invert(73%) sepia(98%) saturate(200%) hue-rotate(220deg)"
            />
            {{ songLabel }}
          </span>
        </span>
      </div>

      <div class="hero-actions flex gap-4 justify-center">
        <button
          class="glass-btn-primary"
          :class="{ 'animate-pulse': isLive, 'opacity-50 cursor-not-allowed': !isLive }"
          @click="enterLiveRoom"
          :disabled="!isLive"
        >
          <span class="text-lg relative z-10">🎬</span>
          <div v-if="isLive" class="flex flex-col items-start leading-tight">
            <span class="text-sm">进入直播间</span>
          </div>
          <div v-else class="flex flex-col items-start leading-tight">
            <span class="text-sm">上次直播</span>
            <span v-if="latestLiveRecord?.live_time" class="text-xs opacity-80">
              {{ formatLiveTime(latestLiveRecord.live_time) }}
            </span>
          </div>
        </button>

        <button v-if="showContributeBtn" class="glass-btn-secondary" @click="goContribute">
          <span class="text-lg relative z-10">📝</span>
          <span class="relative z-10">投 稿</span>
        </button>

        <button class="glass-btn-secondary" @click="openBiliSpace">
          <span class="text-lg relative z-10">💝</span>
          <span class="relative z-10">去关注</span>
        </button>
      </div>

      <VGlass
        class="glass-card-container"
        :blur="10"
        :scale="30"
        :base-frequency="0.015"
        :radius="20"
      >
        <div v-for="stat in stats" :key="stat.id" class="glass-card-stat">
          <div class="stat-glow"></div>
          <span class="stat-icon">{{ stat.icon }}</span>
          <div class="stat-content">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </VGlass>
    </div>

    <div class="hero-particles">
      <span
        v-for="i in 20"
        :key="i"
        class="particle"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${10 + Math.random() * 10}s`,
        }"
      ></span>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 2rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-section.loaded .hero-content {
  opacity: 1;
  transform: translateY(0);
}

.avatar-container {
  margin-bottom: 2.5rem;
}

.avatar-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.avatar-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 0 40px rgba(102, 126, 234, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 0 30px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

.avatar::before {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(102, 126, 234, 0.3);
  animation: avatarRing 3s linear infinite;
}

.avatar::after {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 1px solid rgba(167, 139, 250, 0.2);
  animation: avatarRing 5s linear infinite reverse;
}

@keyframes avatarRing {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow:
    0 0 60px rgba(102, 126, 234, 0.4),
    0 12px 40px rgba(0, 0, 0, 0.25),
    inset 0 0 40px rgba(255, 255, 255, 0.15);
}

.avatar-wrapper.live .avatar {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow:
    0 0 20px rgba(239, 68, 68, 0.4),
    0 0 40px rgba(239, 68, 68, 0.2),
    0 0 60px rgba(239, 68, 68, 0.1),
    inset 0 0 30px rgba(239, 68, 68, 0.1);
  animation: avatarGlow 2s ease-in-out infinite;
}

@keyframes avatarGlow {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(239, 68, 68, 0.4),
      0 0 40px rgba(239, 68, 68, 0.2),
      0 0 60px rgba(239, 68, 68, 0.1),
      inset 0 0 30px rgba(239, 68, 68, 0.1);
  }

  50% {
    box-shadow:
      0 0 30px rgba(239, 68, 68, 0.5),
      0 0 60px rgba(239, 68, 68, 0.25),
      0 0 90px rgba(239, 68, 68, 0.15),
      inset 0 0 50px rgba(239, 68, 68, 0.15);
  }
}

.live-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(239, 68, 68, 0.5);
  animation: ringPulse 1.5s ease-out infinite;
}

.live-ring:nth-child(2) {
  animation-delay: 0.5s;
}

.live-ring:nth-child(3) {
  animation-delay: 1s;
}

@keyframes ringPulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}

.live-indicator {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(239, 68, 68, 0.9);
  backdrop-filter: blur(10px);
  padding: 4px 12px;
  border-radius: 12px;
  animation: indicatorPulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
  white-space: nowrap;
  z-index: 10;
}

.live-indicator-inner {
  display: flex;
  align-items: center;
  gap: 4px;
  animation: indicatorScale 1.5s ease-in-out infinite;
}

@keyframes indicatorPulse {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
  }

  50% {
    opacity: 0.85;
    box-shadow: 0 0 25px rgba(239, 68, 68, 0.7);
  }
}

@keyframes indicatorScale {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }
}

.live-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: dotBlink 0.8s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@keyframes dotBlink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }

  50% {
    opacity: 0.4;
    transform: scale(0.8);
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.4);
  }
}

.live-text {
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(167, 139, 250, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.glass-badge {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
}

.badge-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  animation: badgeShine 3s ease-in-out infinite;
}

@keyframes badgeShine {
  0%,
  100% {
    left: -100%;
  }

  50% {
    left: 100%;
  }
}

.hero-actions {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.glass-btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(167, 139, 250, 0.3) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow:
    0 8px 32px rgba(102, 126, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.glass-btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-btn-secondary:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.glass-card-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  min-width: 280px;
}

.glass-card-stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  min-width: 140px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card-stat:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.stat-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.2),
    transparent,
    rgba(167, 139, 250, 0.2)
  );
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(8px);
  z-index: -1;
}

.glass-card-stat:hover .stat-glow {
  opacity: 1;
}

.stat-icon {
  font-size: 1.6rem;
  filter: grayscale(0.3);
  transition: all 0.3s ease;
}

.glass-card-stat:hover .stat-icon {
  filter: grayscale(0);
  transform: scale(1.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.hero-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(167, 139, 250, 0.5);
  border-radius: 50%;
  animation: float 15s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(-200px) translateX(50px);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .avatar-container {
    margin-bottom: 2rem;
  }

  .avatar-wrapper {
    width: 140px;
    height: 140px;
  }

  .live-indicator {
    bottom: -18px;
    padding: 3.5px 11px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .glass-card-container {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .glass-card-stat {
    padding: 0.75rem 1rem;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .avatar-container {
    margin-bottom: 1.8rem;
  }

  .hero-content {
    padding: 1rem;
  }

  .avatar-wrapper {
    width: 120px;
    height: 120px;
  }

  .live-indicator {
    bottom: -16px;
    padding: 3px 10px;
  }

  .live-text {
    font-size: 0.6rem;
  }

  .live-dot {
    width: 6px;
    height: 6px;
  }

  .hero-title {
    font-size: 1.6rem;
  }

  .glass-card-container {
    min-width: auto;
  }

  .glass-card-stat {
    min-width: 100px;
    padding: 0.6rem 0.8rem;
  }

  .stat-icon {
    font-size: 1.3rem;
  }

  .stat-value {
    font-size: 0.9rem;
  }
}

@media (min-width: 1400px) {
  .avatar-wrapper {
    width: 200px;
    height: 200px;
  }

  .live-indicator {
    bottom: -22px;
    padding: 5px 14px;
  }
}
</style>
