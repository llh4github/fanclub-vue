<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { VGlass } from "@daisigu/vue-liquid-glass"
import {
  getWeeklySchedule,
  getWeekLiveRecords,
  type LiveSchedule,
  type WeekLiveRecord,
} from "@/api"
import { Liko } from "@/config"
import { isSuccess } from "@/api/types"

const sectionRef = ref<HTMLElement>()
const isVisible = ref(false)

interface ScheduledEvent {
  icon: string
  name: string
  planStart: number
  planEnd: number
  tag: string
  color: string
  actualStart?: number
  actualEnd?: number
  status: "pending" | "live" | "completed" | "cancelled"
  isSurprise?: boolean
}

interface DayComparison {
  day: string
  dateStr: string
  dateNum: number
  isToday: boolean
  isPast: boolean
  events: ScheduledEvent[]
}

const now = new Date()
const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1

const scheduleLoading = ref(false)
const scheduleError = ref<string | null>(null)

const weekDays = computed<DayComparison[]>(() => {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  return days.map((day, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - todayIndex + i)
    return {
      day,
      dateStr: `${d.getMonth() + 1}/${d.getDate()}`,
      dateNum: d.getDate(),
      isToday: i === todayIndex,
      isPast: i < todayIndex,
      events: [],
    }
  })
})

const weekRange = computed(() => {
  const firstDay = weekDays.value[0]
  const lastDay = weekDays.value[6]
  return `${firstDay.dateStr} ~ ${lastDay.dateStr}`
})

function formatHour(h: number) {
  const hours = Math.floor(h)
  const mins = Math.round((h - hours) * 60)
  return mins > 0 ? `${hours}:${String(mins).padStart(2, "0")}` : `${hours}:00`
}

function parseTimeToDecimal(timeStr: string | null | undefined): number {
  if (!timeStr) return 0
  const match = timeStr.match(/T(\d{2}):(\d{2}):(\d{2})/)
  if (match) {
    const hours = parseInt(match[1])
    const mins = parseInt(match[2])
    return hours + mins / 60
  }
  return 0
}

function getDateKey(timeStr: string | null | undefined): string {
  if (!timeStr) return ""
  const d = new Date(timeStr)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function getTagAndColor(topic: string): { tag: string; color: string } {
  if (topic.includes("歌回") || topic.includes("歌")) {
    return { tag: "歌回", color: "#06b6d4" }
  }
  if (topic.includes("角色扮演") || topic.includes("扮演")) {
    return { tag: "特别", color: "#8b5cf6" }
  }
  return { tag: "常规", color: "#667eea" }
}

function getTimeDiff(start1: number, start2: number): { diff: number; label: string } {
  const diff = start2 - start1
  const absMins = Math.abs(Math.round(diff * 60))
  if (absMins === 0) {
    return { diff: 0, label: "准点" }
  }
  return {
    diff,
    label: diff > 0 ? `晚${absMins}分钟` : `早${absMins}分钟`,
  }
}

async function fetchWeekData() {
  scheduleLoading.value = true
  scheduleError.value = null

  try {
    const [schedulesRes, recordsRes] = await Promise.all([
      getWeeklySchedule(Liko.BID),
      getWeekLiveRecords(Liko.RoomID),
    ])

    const schedules: LiveSchedule[] =
      isSuccess(schedulesRes.code) && schedulesRes.data ? schedulesRes.data : []
    const records: WeekLiveRecord[] =
      isSuccess(recordsRes.code) && recordsRes.data ? recordsRes.data : []

    buildDayComparison(schedules, records)
  } catch (error) {
    scheduleError.value = "获取日程失败"
    console.error("Failed to fetch schedule data:", error)
  } finally {
    scheduleLoading.value = false
  }
}

function buildDayComparison(schedules: LiveSchedule[], records: WeekLiveRecord[]) {
  const scheduleMap = new Map<string, LiveSchedule[]>()
  const recordMap = new Map<string, WeekLiveRecord[]>()

  schedules.forEach((s) => {
    const key = getDateKey(s.start_time)
    const list = scheduleMap.get(key) || []
    list.push(s)
    scheduleMap.set(key, list)
  })

  records.forEach((r) => {
    const key = getDateKey(r.live_time)
    const list = recordMap.get(key) || []
    list.push(r)
    recordMap.set(key, list)
  })

  const baseDate = new Date(now)
  baseDate.setDate(baseDate.getDate() - todayIndex)

  weekDays.value.forEach((day, index) => {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + index)
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

    const daySchedules = scheduleMap.get(dateKey) || []
    const dayRecords = recordMap.get(dateKey) || []

    const events: ScheduledEvent[] = []
    const usedRecordIndices = new Set<number>()

    daySchedules.forEach((s) => {
      const planStart = parseTimeToDecimal(s.start_time)
      const planEnd = parseTimeToDecimal(s.end_time)
      const { tag, color } = getTagAndColor(s.topic)

      let matchedRecord: WeekLiveRecord | null = null
      let minDiff = Infinity

      for (let i = 0; i < dayRecords.length; i++) {
        if (usedRecordIndices.has(i)) continue
        const r = dayRecords[i]
        const recStart = parseTimeToDecimal(r.live_time)
        const diff = Math.abs(recStart - planStart)
        if (diff < minDiff && diff < 1) {
          minDiff = diff
          matchedRecord = r
        }
      }

      let status: ScheduledEvent["status"] = "pending"
      let actualStart: number | undefined
      let actualEnd: number | undefined

      if (matchedRecord) {
        usedRecordIndices.add(dayRecords.indexOf(matchedRecord))
        actualStart = parseTimeToDecimal(matchedRecord.live_time)
        actualEnd = parseTimeToDecimal(matchedRecord.end_live_time)
        status = matchedRecord.live_status === 1 ? "live" : "completed"
      } else if (day.isPast) {
        status = "cancelled"
      }

      events.push({
        icon: s.emoji,
        name: s.topic,
        planStart,
        planEnd,
        tag,
        color,
        actualStart,
        actualEnd,
        status,
      })
    })

    dayRecords.forEach((r, i) => {
      if (!usedRecordIndices.has(i)) {
        const actualStart = parseTimeToDecimal(r.live_time)
        const actualEnd = parseTimeToDecimal(r.end_live_time)

        events.push({
          icon: "⚡",
          name: "突击直播",
          planStart: 0,
          planEnd: 0,
          tag: "常规",
          color: "#667eea",
          actualStart,
          actualEnd,
          status: r.live_status === 1 ? "live" : "completed",
          isSurprise: true,
        })
      }
    })

    day.events = events.sort((a, b) => {
      const aTime = a.actualStart || a.planStart
      const bTime = b.actualStart || b.planStart
      return aTime - bTime
    })
  })
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!sectionRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) isVisible.value = true
      })
    },
    { threshold: 0.1 },
  )
  observer.observe(sectionRef.value)

  fetchWeekData()

  setTimeout(() => {
    const grid = sectionRef.value?.querySelector(".schedule-grid") as HTMLElement | null
    const todayCard = grid?.querySelector(".day-card.today") as HTMLElement | null
    if (grid && todayCard) {
      const scrollLeft = todayCard.offsetLeft - grid.offsetWidth / 2 + todayCard.offsetWidth / 2
      grid.scrollTo({ left: scrollLeft, behavior: "smooth" })
    }
  }, 600)
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <section ref="sectionRef" id="schedule" class="schedule-section" :class="{ visible: isVisible }">
    <h2 class="section-title">
      <a href="#schedule" class="anchor-link" title="链接到本周日程">
        <span class="anchor-icon">🔗</span>
      </a>
      <span class="title-icon">📅</span>
      本周日程
      <span v-if="scheduleLoading" class="loading-indicator">加载中...</span>
    </h2>
    <div class="week-range">{{ weekRange }}</div>

    <div v-if="scheduleError" class="schedule-error">{{ scheduleError }}</div>

    <div class="schedule-grid">
      <div
        v-for="(d, di) in weekDays"
        :key="d.day"
        class="day-card"
        :class="{
          today: d.isToday,
          past: d.isPast,
        }"
        :style="{ animationDelay: `${di * 0.06}s` }"
      >
        <VGlass class="day-card-glass" :blur="8" :scale="25" :base-frequency="0.015" :radius="14">
          <div class="day-header">
            <span class="day-name" :class="{ today: d.isToday }">{{ d.day }}</span>
            <span class="day-date">{{ d.dateStr }}</span>
            <span v-if="d.isToday" class="today-badge">TODAY</span>
          </div>

          <div v-if="d.events.length === 0" class="rest-content">
            <span class="rest-icon">🛋️</span>
            <span class="rest-text">休息日</span>
          </div>

          <div v-else class="events-list">
            <div
              v-for="(ev, ei) in d.events"
              :key="ei"
              class="event-block"
              :class="[ev.tag, ev.status, { surprise: ev.isSurprise }]"
            >
              <div class="event-main">
                <span class="event-icon">{{ ev.icon }}</span>
                <span class="event-name">{{ ev.name }}</span>
                <span v-if="ev.isSurprise" class="surprise-tag">突</span>
              </div>

              <div class="time-comparison">
                <div v-if="ev.planStart > 0" class="plan-time">
                  <span class="time-label">预计</span>
                  <span class="time-value"
                    >{{ formatHour(ev.planStart) }} - {{ formatHour(ev.planEnd) }}</span
                  >
                </div>

                <div v-if="ev.actualStart && ev.actualEnd" class="actual-time">
                  <span class="time-label">{{ ev.isSurprise ? "开播" : "实际" }}</span>
                  <span class="time-value"
                    >{{ formatHour(ev.actualStart) }} - {{ formatHour(ev.actualEnd) }}</span
                  >
                  <span
                    v-if="ev.planStart > 0"
                    class="time-diff"
                    :class="getTimeDiff(ev.planStart, ev.actualStart).diff > 0 ? 'late' : 'early'"
                  >
                    {{ getTimeDiff(ev.planStart, ev.actualStart).label }}
                  </span>
                </div>

                <div v-else-if="ev.status === 'cancelled'" class="cancelled-hint">已取消</div>
                <div v-else-if="ev.status === 'pending'" class="pending-hint">待开播</div>
              </div>
            </div>
          </div>
        </VGlass>
      </div>
    </div>

    <div class="schedule-footer">
      <span>⏰ 蓝色=准时/提前 | 紫色=推迟 | 虚线=待确认 | 数据仅供参考，以主播实际安排为准</span>
    </div>
  </section>
</template>

<style scoped>
.schedule-section {
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

.schedule-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-title {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #ffffff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
}

.loading-indicator {
  font-size: 0.7rem;
  color: rgba(167, 139, 250, 0.5);
  font-weight: normal;
}

.mock-badge {
  font-size: 0.55rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.week-range {
  font-size: 0.85rem;
  color: rgba(167, 139, 250, 0.5);
  margin-top: -0.5rem;
  font-family: "SF Mono", "Fira Code", monospace;
}

.schedule-error {
  color: #f87171;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(248, 113, 113, 0.2);
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
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

.schedule-grid {
  width: 100%;
  max-width: 1100px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.schedule-grid::-webkit-scrollbar {
  height: 4px;
}

.schedule-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 2px;
}

.schedule-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(139, 92, 246, 0.4));
  border-radius: 2px;
}

.day-card {
  display: flex;
  flex-direction: column;
  min-width: 210px;
  min-height: 220px;
  flex-shrink: 0;
  scroll-snap-align: start;
}

.day-card-glass {
  width: 100%;
  height: 100%;
  padding: 1.4rem 1.2rem;
  display: flex;
  flex-direction: column;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.day-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow:
    0 8px 32px rgba(102, 126, 234, 0.15),
    0 0 20px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.day-card.today {
  background: rgba(225, 29, 72, 0.08);
  border-color: rgba(225, 29, 72, 0.4);
  box-shadow:
    0 0 30px rgba(225, 29, 72, 0.2),
    0 0 60px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.day-card.past {
  opacity: 0.55;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.day-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.day-name.today {
  background: linear-gradient(135deg, #667eea, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.day-date {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
  font-family: "SF Mono", "Fira Code", monospace;
}

.today-badge {
  font-size: 0.45rem;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(139, 92, 246, 0.3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 1px 5px;
  border-radius: 4px;
  animation: badgeGlow 2s ease-in-out infinite;
  margin-left: auto;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

@keyframes badgeGlow {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(102, 126, 234, 0);
  }

  50% {
    box-shadow: 0 0 12px rgba(102, 126, 234, 0.4);
  }
}

.rest-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 1.5rem 0;
}

.rest-icon {
  font-size: 1.6rem;
  opacity: 0.5;
}

.rest-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.2);
  font-style: italic;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
}

.event-block {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.25s ease;
}

.event-block:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.25);
  box-shadow:
    0 4px 20px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.event-block.常规 {
  border-left: 3px solid rgba(102, 126, 234, 0.6);
}

.event-block.歌回 {
  border-left: 3px solid rgba(6, 182, 212, 0.6);
}

.event-block.特别 {
  border-left: 3px solid rgba(139, 92, 246, 0.7);
}

.event-block.pending {
  border-left-style: dashed;
  background: repeating-linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.04) 4px,
    transparent 4px,
    transparent 8px
  );
}

.event-block.live {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.25);
  animation: livePulse 2s ease-in-out infinite;
}

@keyframes livePulse {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(102, 126, 234, 0);
  }

  50% {
    box-shadow: 0 0 12px rgba(102, 126, 234, 0.3);
  }
}

.event-block.surprise {
  background: rgba(255, 255, 255, 0.06);
  border-style: dashed;
  border-color: rgba(167, 139, 250, 0.3);
}

.event-block.surprise .surprise-tag {
  font-size: 0.55rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(139, 92, 246, 0.3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 1px 5px;
  border-radius: 3px;
  margin-left: 0.3rem;
  font-weight: 600;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.event-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.event-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  line-height: 1;
}

.event-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.time-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.plan-time,
.actual-time {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
}

.time-label {
  color: rgba(255, 255, 255, 0.4);
  min-width: 2.5em;
  font-size: 0.6rem;
}

.plan-time .time-value {
  color: rgba(255, 255, 255, 0.55);
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 0.65rem;
}

.actual-time .time-value {
  background: linear-gradient(135deg, #667eea, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: "SF Mono", "Fira Code", monospace;
  font-weight: 600;
  font-size: 0.65rem;
}

.time-diff {
  font-size: 0.5rem;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 500;
}

.time-diff.early {
  background: rgba(102, 126, 234, 0.2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.time-diff.late {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pending-hint,
.cancelled-hint {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
  margin-left: 2.5em;
}

.cancelled-hint {
  color: rgba(239, 68, 68, 0.5);
}

.schedule-footer {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1024px) {
  .schedule-section {
    padding: 3rem 1rem;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1.4rem;
  }

  .schedule-grid {
    gap: 8px;
  }

  .day-card {
    padding: 0.8rem 0.7rem;
    min-width: 135px;
    min-height: 180px;
  }

  .event-icon {
    font-size: 1rem;
  }

  .event-name {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .schedule-section {
    padding: 2rem 0.8rem;
  }

  .schedule-grid {
    gap: 8px;
  }

  .day-card {
    padding: 0.7rem 0.6rem;
    border-radius: 10px;
    min-width: 120px;
    min-height: 160px;
  }

  .day-name {
    font-size: 0.8rem;
  }

  .event-icon {
    font-size: 0.9rem;
  }

  .event-name {
    font-size: 0.7rem;
  }

  .time-comparison {
    gap: 0.2rem;
  }

  .plan-time,
  .actual-time {
    font-size: 0.6rem;
    gap: 0.3rem;
  }

  .time-label {
    font-size: 0.5rem;
    min-width: 2em;
  }

  .time-value {
    font-size: 0.55rem !important;
  }
}

@media (max-width: 380px) {
  .day-card {
    min-width: 105px;
  }
}
</style>
