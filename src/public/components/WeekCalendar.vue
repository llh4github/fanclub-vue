<template>
  <section id="week-calendar" class="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-card/30">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16 animate-fade-in">
        <div class="inline-block mb-4">
          <span
            class="text-sm tracking-[0.3em] text-[#DF7623] border border-[#DF7623]/30 px-4 py-1 clip-corner"
          >
            CALENDAR
          </span>
        </div>
        <h2
          class="text-3xl sm:text-5xl mb-2 cursor-pointer hover:text-[#DF7623] transition-colors"
          @click="handleTitleClick"
        >
          本周日程
        </h2>
        <p class="text-sm text-muted-foreground">{{ weekDateRange }}</p>
      </div>

      <div class="bg-[#1a1a1a] border border-border p-6 clip-corner" style="max-height: 600px; overflow-y: auto;">
        <VueCal
          ref="calendarRef"
          :events="calendarEvents"
          :disable-views="['years', 'year', 'month']"
          default-view="week"
          :min-date="new Date()"
          :time="true"
          locale="zh-cn"
          :start-week-on-sunday="false"
          :time-cell-height="40"
          :time-step="60"
          :time-from="0"
          :time-to="1440"
          :views-bar="false"
          :title-bar="false"
          theme="dark"
          :event-class="(event: CalendarEvent) => (event.class ? event.class : '')"
          @ready="handleCalendarReady"
        />
      </div>

      <!-- 图例说明 -->
      <div class="mt-4 text-xs text-gray-400">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded-full bg-[#DF7623]"></div>
            <span>计划直播</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded-full bg-[#00f5ff]"></div>
            <span>实际直播</span>
          </div>
        </div>
      </div>

      <!-- 免责说明 -->
      <div class="mt-2 text-xs text-gray-400">
        <p>1. 数据来源于AI识别主播周表图</p>
        <p>2. 主播有播瘾，结束时间仅供参考，大概率会播很久</p>
        <p>3. 页面直播日程仅供参考，以主播实际安排为准</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { VueCal } from 'vue-cal'
import 'vue-cal/style'
import { anchorService, type AnchorLiveScheduleItemView } from '@/api/services/anchor'
import { LIKO_INFO } from '@/common/constants/anchor'

// 计算本周的日期范围
const weekDateRange = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()

  // 计算本周一的日期
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  // 计算本周日的日期
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return `${formatDate(monday)} ~ ${formatDate(sunday)}`
})

// 处理标题点击事件，添加锚点功能
const handleTitleClick = () => {
  // 设置URL hash
  window.location.hash = 'week-calendar'

  // 滚动到当前section
  const section = document.getElementById('week-calendar')
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
}

// 定义日历事件类型
interface CalendarEvent {
  title: string
  start: Date
  end: Date
  class?: string
  source?: string
}

// 日历事件数据
const calendarEvents = ref<CalendarEvent[]>([])

// 日历 ref
const calendarRef = ref<any>(null)

// 当日历准备就绪时滚动到当前时间
const handleCalendarReady = () => {
  if (calendarRef.value) {
    try {
      // 检查是否存在 scrollToCurrentTime 方法
      if (typeof calendarRef.value.scrollToCurrentTime === 'function') {
        calendarRef.value.scrollToCurrentTime()
      } else if (typeof calendarRef.value.scrollToTime === 'function') {
        // 尝试使用 scrollToTime 方法
        const now = new Date()
        calendarRef.value.scrollToTime(now.getHours(), now.getMinutes())
      } else {
        console.log('No scroll to time method found in vue-cal')
      }
    } catch (error) {
      console.error('Error scrolling to current time:', error)
    }
  }
}

// 获取周日程数据
const fetchWeekSchedule = async () => {
  try {
    const today = new Date().toISOString().split('T')[0] || ''

    // 并行请求两个接口
    const [scheduleResponse, recordResponse] = await Promise.all([
      anchorService.queryWeekSchedule({
        week: today,
        bid: LIKO_INFO.uid,
      }),
      anchorService.queryWeekLiveRecord({
        week: today,
        roomId: LIKO_INFO.roomId,
      }),
    ])

    // 清空现有事件
    calendarEvents.value = []

    // 添加日程数据（计划）
    if (scheduleResponse.code === '200' && scheduleResponse.data) {
      scheduleResponse.data.forEach((item: AnchorLiveScheduleItemView) => {
        calendarEvents.value.push({
          title: item.topic,
          start: new Date(item.startTime),
          end: new Date(item.endTime),
          class: 'schedule-event',
          source: 'schedule',
        })
      })
    }

    // 添加直播记录数据（实际）
    if (recordResponse.code === '200' && recordResponse.data) {
      recordResponse.data.forEach((item: any) => {
        calendarEvents.value.push({
          title: '实际直播',
          start: new Date(item.liveTime),
          end: new Date(item.endLiveTime),
          class: 'record-event',
          source: 'record',
        })
      })
    }
  } catch (error) {
    console.error('Failed to fetch week data:', error)
  }
}

onMounted(() => {
  // 获取周日程数据
  fetchWeekSchedule()
})
</script>

<style scoped>
.clip-corner {
  clip-path: polygon(
    0 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
</style>

<style>
/* 日历事件样式 */
.vuecal__event-details {
  color: white !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  margin: 2px 0 !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

/* 计划直播事件样式 */
.schedule-event {
  background-color: #df7623 !important;
  color: white !important;
}

/* 实际直播事件样式 */
.record-event {
  background-color: #00f5ff !important;
  color: #0a0a0f !important;
  font-weight: 500 !important;
}

/* 为单元格添加左右边框 */
.vuecal__cell {
  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* 隐藏事件块中的时间显示 */
.vuecal__event-start,
.vuecal__event-end {
  display: none !important;
}

/* 调整日历头部高度 */
.vuecal__headings {
  height: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
}

/* 调整星期几标题高度 */
.vuecal__weekday {
  height: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  padding: 4px 0 !important;
}

/* 隐藏星期几日期部分 */
.vuecal__weekday-date {
  display: none !important;
}

/* 调整星期几文字部分 */
.vuecal__weekday-day {
  font-size: 14px !important;
  line-height: 1.5 !important;
  text-align: center !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100% !important;
}
</style>
