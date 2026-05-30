<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { getLatestFollowerNum, getTopicCount } from "@/api"
import { getLatestLiveRecord, LiveRecordStatus, type LatestLiveRecord } from "@/api/schedule"
import { Liko } from "@/config"
import { isSuccess } from "@/api/types"
import avatar_a from "@/assets/avatar/avatar_a.webp"
import avatar_ku from "@/assets/avatar/avatar_ku.webp"
import avatar_xiao from "@/assets/avatar/avatar_xiao.webp"
import avatar_04 from "@/assets/avatar/avatar_04.jpg"
import IconUsers from "@/components/icons/IconUsers.vue"
import IconPlay from "@/components/icons/IconPlay.vue"
import IconCake from "@/components/icons/IconCake.vue"
import IconStar from "@/components/icons/IconStar.vue"
import IconFile from "@/components/icons/IconFile.vue"

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
  { id: "fans", icon: IconUsers, label: "粉丝", value: computed(() => fansCount.value) },
  { id: "streams", icon: IconPlay, label: "出道天数", value: computed(() => `${debutDays.value}天`) },
  { id: "birthday", icon: IconCake, label: "生日", value: "8月3日" },
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

const latestFansNum = ref(0)
const songLabel = ref("歌势")

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

  setTimeout(() => {
    songLabel.value = "杂谈势"
  }, 3000)
})
</script>

<template>
  <section id="home" class="hero-section" :class="{ loaded: isLoaded }">
    <div class="hero-content">
      <!-- Avatar section with cyberpunk frame -->
      <div class="avatar-section">
        <div class="avatar-frame">
          <div class="frame-corner top-left"></div>
          <div class="frame-corner top-right"></div>
          <div class="frame-corner bottom-left"></div>
          <div class="frame-corner bottom-right"></div>
          <div class="avatar-wrapper" :class="{ live: isLive }">
            <div class="avatar-glow"></div>
            <img :src="randomAvatar" alt="莉蔻Liko" class="avatar" />
            <div v-if="isLive" class="live-badge">
              <span class="live-dot"></span>
              <span class="live-text">直播中</span>
            </div>
          </div>
        </div>
        <div class="avatar-decoration">
          <span class="deco-line"></span>
          <span class="deco-text">VR所属</span>
          <span class="deco-line"></span>
        </div>
      </div>

      <!-- Name with glitch effect -->
      <h1 class="hero-title">
        <span class="title-text">莉蔻</span>
        <span class="title-accent">Liko</span>
      </h1>

      <!-- Tags row -->
      <div class="hero-tags">
        <span class="tag tag-primary">虚拟主播</span>
        <span class="tag">{{ songLabel }}</span>
      </div>

      <!-- Action buttons -->
      <div class="hero-actions">
        <button
          class="action-btn action-primary"
          :class="{ 'animate-pulse': isLive, 'opacity-50 cursor-not-allowed': !isLive }"
          @click="enterLiveRoom"
          :disabled="!isLive"
        >
          <span class="btn-icon">
            <IconPlay :size="18" />
          </span>
          <span class="btn-text">
            {{ isLive ? "进入直播间" : "上次直播" }}
            <span v-if="!isLive && latestLiveRecord?.live_time" class="btn-sub">
              {{ formatLiveTime(latestLiveRecord.live_time) }}
            </span>
          </span>
        </button>

        <button v-if="showContributeBtn" class="action-btn action-secondary" @click="goContribute">
          <span class="btn-icon">
            <IconFile :size="18" />
          </span>
          <span class="btn-text">投稿</span>
        </button>

        <button class="action-btn action-secondary" @click="openBiliSpace">
          <span class="btn-icon">
            <IconStar :size="18" />
          </span>
          <span class="btn-text">关注</span>
        </button>
      </div>

      <!-- Stats cards - asymmetric layout -->
      <div class="stats-section">
        <div v-for="stat in stats" :key="stat.id" class="stat-card">
          <span class="stat-icon">
            <component :is="stat.icon" :size="24" />
          </span>
          <div class="stat-content">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating particles -->
    <div class="hero-particles">
      <span
        v-for="i in 12"
        :key="i"
        class="particle"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${8 + Math.random() * 8}s`,
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
  padding: 4rem 1rem;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-section.loaded .hero-content {
  opacity: 1;
  transform: translateY(0);
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.avatar-frame {
  position: relative;
  padding: 20px;
}

.frame-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #00f5ff;
  border-style: solid;
}

.frame-corner.top-left {
  top: 0;
  left: 0;
  border-width: 3px 0 0 3px;
}

.frame-corner.top-right {
  top: 0;
  right: 0;
  border-width: 3px 3px 0 0;
}

.frame-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 3px 3px;
}

.frame-corner.bottom-right {
  bottom: 0;
  right: 0;
  border-width: 0 3px 3px 0;
}

.avatar-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
}

.avatar-glow {
  position: absolute;
  inset: -30px;
  background: radial-gradient(circle,
    rgba(0, 245, 255, 0.3) 0%,
    rgba(139, 92, 246, 0.15) 40%,
    transparent 70%);
  border-radius: 50%;
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 0;
  border: 2px solid rgba(0, 245, 255, 0.5);
  position: relative;
  filter: saturate(1.1);
  transition: all 0.3s ease;
}

.avatar:hover {
  border-color: #00f5ff;
  box-shadow:
    0 0 30px rgba(0, 245, 255, 0.4),
    inset 0 0 20px rgba(0, 245, 255, 0.1);
}

.avatar-wrapper.live .avatar {
  border-color: #ff6b35;
  animation: live-glow 1.5s ease-in-out infinite;
}

@keyframes live-glow {
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
  }
  50% {
    box-shadow: 0 0 50px rgba(255, 107, 53, 0.8);
  }
}

.live-badge {
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ff6b35;
  padding: 6px 14px;
  animation: badge-blink 1s ease-in-out infinite;
  white-space: nowrap;
}

@keyframes badge-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.live-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: dot-pulse 0.8s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.8); opacity: 0.6; }
}

.live-text {
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

.avatar-decoration {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.deco-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
}

.deco-text {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 3px;
  color: #00f5ff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
}

/* Title with glitch effect */
.hero-title {
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0;
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.title-text {
  color: #fff;
  text-shadow:
    0 0 20px rgba(0, 245, 255, 0.5),
    2px 2px 0 #00f5ff,
    -2px -2px 0 #ff6b35;
  animation: glitch-text 4s ease-in-out infinite;
}

@keyframes glitch-text {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(-2px, 1px); }
  94% { transform: translate(2px, -1px); }
  96% { transform: translate(-1px, -1px); }
  98% { transform: translate(1px, 1px); }
}

.title-accent {
  background: linear-gradient(135deg, #00f5ff, #8b5cf6, #ff6b35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.2rem;
}

/* Tags */
.hero-tags {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tag {
  padding: 0.4rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  transition: all 0.3s ease;
}

.tag::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #00f5ff;
}

.tag-primary {
  border-color: rgba(0, 245, 255, 0.4);
  color: #00f5ff;
}

.tag-primary::before {
  background: linear-gradient(180deg, #00f5ff, #8b5cf6);
}

.tag:hover {
  border-color: rgba(0, 245, 255, 0.5);
  color: #fff;
}

/* Action buttons */
.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 1px;
  border: 2px solid;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 120px;
}

.action-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.action-btn:hover::before {
  transform: translateX(100%);
}

.action-primary {
  background: transparent;
  border-color: #ff6b35;
  color: #ff6b35;
}

.action-primary:hover:not(:disabled) {
  background: rgba(255, 107, 53, 0.15);
  border-color: #ff9e5e;
  color: #fff;
  box-shadow:
    0 0 25px rgba(255, 107, 53, 0.4),
    inset 0 0 15px rgba(255, 107, 53, 0.1);
  text-shadow: 0 0 10px rgba(255, 107, 53, 0.8);
}

.action-secondary {
  border-color: rgba(139, 92, 246, 0.5);
  color: #8b5cf6;
}

.action-secondary:hover {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
  color: #fff;
  box-shadow:
    0 0 20px rgba(139, 92, 246, 0.3),
    inset 0 0 15px rgba(139, 92, 246, 0.1);
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
}

.btn-icon {
  display: flex;
  align-items: center;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.btn-sub {
  font-size: 0.65rem;
  opacity: 0.7;
  font-weight: 400;
}

/* Stats section */
.stats-section {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
  width: 100%;
  max-width: 600px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.2rem;
  background: rgba(10, 8, 18, 0.8);
  border: 1px solid rgba(0, 245, 255, 0.2);
  position: relative;
  flex: 1;
  min-width: 140px;
  transition: all 0.3s ease;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #00f5ff, #8b5cf6);
}

.stat-card:hover {
  border-color: rgba(0, 245, 255, 0.5);
  background: rgba(0, 245, 255, 0.05);
}

.stat-icon {
  display: flex;
  align-items: center;
  color: rgba(0, 245, 255, 0.6);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  color: #00f5ff;
  transform: scale(1.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.3);
}

/* Particles */
.hero-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #00f5ff;
  border-radius: 50%;
  animation: particle-float 12s ease-in-out infinite;
  box-shadow: 0 0 6px #00f5ff;
}

.particle:nth-child(even) {
  background: #ff6b35;
  box-shadow: 0 0 6px #ff6b35;
}

.particle:nth-child(3n) {
  background: #8b5cf6;
  box-shadow: 0 0 6px #8b5cf6;
}

@keyframes particle-float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% {
    transform: translateY(-150px) translateX(30px);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1rem;
  }

  .hero-title {
    font-size: 2.2rem;
    flex-direction: column;
    gap: 0.2rem;
  }

  .title-accent {
    font-size: 1.8rem;
  }

  .avatar-wrapper {
    width: 130px;
    height: 130px;
  }

  .stats-section {
    gap: 1rem;
  }

  .stat-card {
    min-width: 120px;
    padding: 0.8rem 1rem;
  }

  .action-btn {
    padding: 0.7rem 1.2rem;
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .title-accent {
    font-size: 1.5rem;
  }

  .avatar-wrapper {
    width: 110px;
    height: 110px;
  }

  .hero-tags {
    gap: 0.6rem;
  }

  .tag {
    padding: 0.3rem 0.8rem;
    font-size: 0.7rem;
  }

  .stats-section {
    flex-direction: column;
    align-items: center;
  }

  .stat-card {
    width: 100%;
    max-width: 280px;
  }

  .action-btn {
    min-width: 100px;
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
}
</style>