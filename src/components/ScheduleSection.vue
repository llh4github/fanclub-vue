<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import IconLink from "@/components/icons/IconLink.vue"
import IconCouch from "@/components/icons/IconCouch.vue"
import IconBolt from "@/components/icons/IconBolt.vue"
import IconCalendar from "@/components/icons/IconCalendar.vue"
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
    return { tag: "歌回", color: "#00f5ff" }
  }
  if (topic.includes("角色扮演") || topic.includes("扮演")) {
    return { tag: "特别", color: "#ff00ff" }
  }
  return { tag: "常规", color: "#8b5cf6" }
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
          color: "#8b5cf6",
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
    <div class="section-header">
      <a href="#schedule" class="anchor-link" title="链接到本周日程" aria-label="链接到本周日程">
        <IconLink :size="16" />
      </a>
      <div class="section-title-wrapper">
        <span class="title-icon">
          <IconCalendar :size="24" />
        </span>
        <h2 class="section-title">本周日程</h2>
      </div>
      <span v-if="scheduleLoading" class="loading-indicator">加载中...</span>
      <div class="week-range">{{ weekRange }}</div>
    </div>

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
        :style="{ animationDelay: `${di * 0.08}s` }"
      >
        <div class="day-card-inner">
          <div class="day-header">
            <span class="day-name" :class="{ today: d.isToday }">{{ d.day }}</span>
            <span class="day-date">{{ d.dateStr }}</span>
            <span v-if="d.isToday" class="today-badge">TODAY</span>
          </div>

          <div v-if="d.events.length === 0" class="rest-content">
            <span class="rest-icon">
              <IconCouch :size="24" />
            </span>
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
                <span class="event-icon">
                  <IconBolt v-if="ev.isSurprise" :size="18" />
                  <span v-else class="event-emoji">{{ ev.icon }}</span>
                </span>
                <span class="event-name">{{ ev.name }}</span>
                <span v-if="ev.isSurprise" class="surprise-tag">突</span>
              </div>

              <div class="time-comparison">
                <div v-if="ev.planStart > 0" class="plan-time">
                  <span class="time-label">预计</span>
                  <span class="time-value">
                    {{ formatHour(ev.planStart) }} - {{ formatHour(ev.planEnd) }}
                  </span>
                </div>

                <div v-if="ev.actualStart && ev.actualEnd" class="actual-time">
                  <span class="time-label">{{ ev.isSurprise ? "开播" : "实际" }}</span>
                  <span class="time-value highlight">
                    {{ formatHour(ev.actualStart) }} - {{ formatHour(ev.actualEnd) }}
                  </span>
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
        </div>

        <!-- Corner decorations -->
        <div class="corner-deco top-left"></div>
        <div class="corner-deco top-right"></div>
        <div class="corner-deco bottom-left"></div>
        <div class="corner-deco bottom-right"></div>
      </div>
    </div>

    <div class="schedule-footer">
      <span class="footer-text">
        <span class="footer-line"></span>
        <span class="footer-info">蓝色=准时/提前 · 紫色=推迟 · 虚线=待确认</span>
        <span class="footer-line"></span>
      </span>
    </div>

    <p class="schedule-disclaimer">数据仅供参考，以主播实际安排为准</p>
  </section>
</template>

<style scoped>
.schedule-section {
  padding: 5rem 1rem;
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

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  position: relative;
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
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.section-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0;
  color: #fff;
  text-shadow:
    0 0 20px rgba(0, 245, 255, 0.5),
    2px 2px 0 #8b5cf6;
  letter-spacing: 4px;
}

.loading-indicator {
  font-size: 0.7rem;
  color: rgba(0, 245, 255, 0.5);
}

.week-range {
  font-size: 0.8rem;
  color: rgba(0, 245, 255, 0.4);
  font-family: monospace;
  letter-spacing: 2px;
}

.schedule-error {
  color: #ff6b35;
  font-size: 0.85rem;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
}

/* Schedule Grid */
.schedule-grid {
  width: 100%;
  max-width: 1000px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 1rem 0.5rem;
  scroll-snap-type: x mandatory;
}

.schedule-grid::-webkit-scrollbar {
  height: 4px;
}

.schedule-grid::-webkit-scrollbar-track {
  background: rgba(0, 245, 255, 0.05);
}

.schedule-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #00f5ff, #8b5cf6);
  border-radius: 2px;
}

.day-card {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  min-height: 240px;
  flex-shrink: 0;
  scroll-snap-align: start;
  background: rgba(10, 8, 18, 0.9);
  border: 1px solid rgba(139, 92, 246, 0.3);
  position: relative;
  animation: card-fade-in 0.5s ease both;
  transition: all 0.3s ease;
}

@keyframes card-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.day-card:hover {
  border-color: rgba(0, 245, 255, 0.5);
  box-shadow: 0 0 30px rgba(0, 245, 255, 0.15);
  transform: translateY(-4px);
}

.day-card.today {
  border-color: #00f5ff;
  box-shadow:
    0 0 40px rgba(0, 245, 255, 0.2),
    inset 0 0 30px rgba(0, 245, 255, 0.05);
}

.day-card.today::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00f5ff, #8b5cf6, #ff6b35);
}

.day-card.past {
  opacity: 0.5;
}

.day-card-inner {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Corner decorations */
.corner-deco {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: rgba(0, 245, 255, 0.4);
  border-style: solid;
  transition: all 0.3s ease;
}

.day-card:hover .corner-deco {
  border-color: #00f5ff;
}

.corner-deco.top-left {
  top: 4px;
  left: 4px;
  border-width: 2px 0 0 2px;
}

.corner-deco.top-right {
  top: 4px;
  right: 4px;
  border-width: 2px 2px 0 0;
}

.corner-deco.bottom-left {
  bottom: 4px;
  left: 4px;
  border-width: 0 0 2px 2px;
}

.corner-deco.bottom-right {
  bottom: 4px;
  right: 4px;
  border-width: 0 2px 2px 0;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  flex-wrap: wrap;
}

.day-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.day-name.today {
  color: #00f5ff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
}

.day-date {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}

.today-badge {
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #00f5ff;
  padding: 2px 6px;
  border: 1px solid rgba(0, 245, 255, 0.5);
  margin-left: auto;
  animation: badge-blink 1.5s ease-in-out infinite;
}

@keyframes badge-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.rest-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.rest-icon {
  color: rgba(139, 92, 246, 0.3);
}

.rest-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.2);
  font-style: italic;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: 1;
  overflow-y: auto;
}

.event-block {
  background: rgba(0, 245, 255, 0.03);
  border: 1px solid rgba(0, 245, 255, 0.2);
  padding: 0.8rem;
  position: relative;
  transition: all 0.3s ease;
}

.event-block::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--event-color, #8b5cf6);
}

.event-block:hover {
  background: rgba(0, 245, 255, 0.08);
  border-color: rgba(0, 245, 255, 0.4);
}

.event-block.常规 { --event-color: #8b5cf6; }
.event-block.歌回 { --event-color: #00f5ff; }
.event-block.特别 { --event-color: #ff00ff; }

.event-block.pending {
  border-style: dashed;
  opacity: 0.7;
}

.event-block.live {
  border-color: #ff6b35;
  animation: event-live 2s ease-in-out infinite;
}

@keyframes event-live {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 107, 53, 0); }
  50% { box-shadow: 0 0 15px rgba(255, 107, 53, 0.3); }
}

.event-main {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.event-icon {
  display: flex;
  align-items: center;
  color: var(--event-color, #8b5cf6);
}

.event-emoji {
  font-size: 1.2rem;
}

.event-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
}

.surprise-tag {
  font-size: 0.55rem;
  color: #ff6b35;
  padding: 1px 5px;
  border: 1px solid rgba(255, 107, 53, 0.5);
  font-weight: 700;
}

.time-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  color: rgba(255, 255, 255, 0.6);
  font-family: monospace;
}

.actual-time .time-value {
  color: #00f5ff;
  font-family: monospace;
  font-weight: 600;
}

.time-diff {
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.time-diff.early {
  background: rgba(0, 245, 255, 0.2);
  color: #00f5ff;
}

.time-diff.late {
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
}

.pending-hint,
.cancelled-hint {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
  margin-left: 2.5em;
}

.cancelled-hint {
  color: rgba(255, 107, 53, 0.5);
}

/* Footer */
.schedule-footer {
  margin-top: 1rem;
  width: 100%;
  max-width: 1000px;
}

.footer-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.footer-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.3), transparent);
}

.footer-info {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
}

/* Disclaimer */
.schedule-disclaimer {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-section {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .day-card {
    min-width: 160px;
    min-height: 200px;
  }

  .day-card-inner {
    padding: 1rem;
  }
}

@media (max-width: 640px) {
  .day-card {
    min-width: 140px;
    min-height: 180px;
  }

  .event-name {
    font-size: 0.75rem;
  }

  .time-value {
    font-size: 0.65rem !important;
  }
}
</style>