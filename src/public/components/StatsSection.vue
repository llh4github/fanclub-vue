<template>
  <div
    class="mt-12 flex items-center justify-center gap-6"
    :class="{ 'animate-fade-in-delay-800': true }"
  >
    <div class="flex items-center gap-2">
      <n-popover
        trigger="click"
        placement="bottom-start"
        :width="320"
        :content-style="{
          backgroundColor: '#1a1a2e',
          borderColor: '#333',
          borderRadius: '8px',
        }"
        :theme-overrides="popoverThemeOverrides"
      >
        <template #trigger>
          <div class="follwer-num-info flex items-center gap-1 relative group cursor-pointer">
            <span
              class="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-[#DF7623] transition-colors cursor-pointer"
            >
              <DollarSign
                class="w-5 h-5 text-[#DF7623] fill-current group-hover:scale-110 transition-transform"
              />
              身价：
              <n-number-animation :from="0" :to="followerNum" :duration="3000" />
              蔻萝特
            </span>
          </div>
        </template>
        <!-- 弹出的图表 -->
        <div class="p-4 bg-[#1a1a2e] text-white">
          <v-chart class="w-full h-60" :option="followerChartOption" />
        </div>
      </n-popover>
    </div>
    <div class="w-px h-4 bg-border"></div>
    <div class="flex items-center gap-2 group">
      <n-popover
        trigger="click"
        placement="bottom-start"
        :width="320"
        :content-style="{
          backgroundColor: '#1a1a2e',
          borderColor: '#333',
          borderRadius: '8px',
        }"
        :theme-overrides="popoverThemeOverrides"
      >
        <template #trigger>
          <span
            class="text-sm text-muted-foreground flex items-center gap-2 group-hover:text-[#00f5ff] transition-colors cursor-pointer"
          >
            <Calendar
              class="w-5 h-5 text-[#00f5ff] group-hover:scale-110 transition-transform"
            />
            已出道 <n-number-animation :from="0" :to="daysSinceDebut" :duration="3000" /> 天
          </span>
        </template>
        <!-- 弹出的热力图 -->
        <div class="p-4 bg-[#1a1a2e] text-white">
          <n-config-provider :locale="locale" :date-locale="dateLocale" :theme="theme">
            <n-heatmap
              :color-theme="'red'"
              :data="
                liveDurationHistory.map((item) => ({
                  timestamp: dayjs(item.statDate).valueOf(),
                  value: parseFloat((item.liveDuration / 3600).toFixed(1)), // 转化为小时数并保留一位小数
                }))
              "
              :size="'medium'"
              :show-month-labels="true"
              :show-week-labels="true"
              :show-color-indicator="true"
              :tooltip="{ placement: 'bottom', delay: 50 }"
            >
              <template #tooltip="{ timestamp, value }">
                <div>{{ dayjs(timestamp).format('YYYY-MM-DD') }}</div>
                <div>直播 {{ value?.toFixed(1) ?? 0 }} 小时</div>
              </template>
            </n-heatmap>
          </n-config-provider>
        </div>
      </n-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { DollarSign, Calendar } from 'lucide-vue-next'
import {
  NNumberAnimation,
  NPopover,
  NHeatmap,
  NConfigProvider,
  zhCN,
  dateZhCN,
  darkTheme,
} from 'naive-ui'
import { LIKO_INFO } from '@/common/constants/anchor'
import {
  anchorService,
  type AnchorFollowerDateNum,
  type AnchorLiveDurationDateDuration,
} from '@/api'
import dayjs from 'dayjs'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'

// 确保语言包和主题在模板中可用
const locale = zhCN
const dateLocale = dateZhCN
const theme = darkTheme

// popover 深色主题覆盖
const popoverThemeOverrides = {
  color: '#1a1a2e',
  textColor: '#fff',
}

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  LabelLayout,
  UniversalTransition,
])

const daysSinceDebut = ref<number>(0)
const followerNum = ref<number>(0)

// 粉丝数历史相关
const followerHistory = ref<AnchorFollowerDateNum[]>([])
const isLoadingFollowerHistory = ref<boolean>(false)

// 直播时长历史相关
const liveDurationHistory = ref<AnchorLiveDurationDateDuration[]>([])
const isLoadingLiveDurationHistory = ref<boolean>(false)

// 图表配置
const followerChartOption = computed(() => {
  return {
    backgroundColor: 'transparent',
    textStyle: {
      color: '#e5e5e5',
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 10, 15, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#e5e5e5',
      },
      formatter: function (params: any) {
        return `${params[0].name}<br/>粉丝数: ${params[0].value.toLocaleString()}`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: followerHistory.value.map((item) => item.cntDate),
      axisLine: {
        lineStyle: {
          color: '#555',
        },
      },
      axisLabel: {
        color: '#999',
      },
      splitLine: {
        lineStyle: {
          color: '#333',
        },
      },
    },
    yAxis: {
      type: 'value',
      min: 7000,
      axisLine: {
        lineStyle: {
          color: '#555',
        },
      },
      axisLabel: {
        formatter: '{value}',
        color: '#999',
      },
      splitLine: {
        lineStyle: {
          color: '#333',
        },
      },
    },
    series: [
      {
        name: '粉丝数',
        type: 'line',
        smooth: true,
        data: followerHistory.value.map((item) => item.followerNum),
        lineStyle: {
          color: '#DF7623',
        },
        itemStyle: {
          color: '#DF7623',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(223, 118, 35, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(223, 118, 35, 0.1)',
              },
            ],
          },
        },
      },
    ],
  }
})

const calculateDaysSinceDebut = () => {
  return dayjs(new Date()).diff(dayjs(LIKO_INFO.debutDate), 'day')
}

// 加载粉丝数历史数据
const loadFollowerHistory = async () => {
  if (isLoadingFollowerHistory.value) return

  try {
    // 检查本地缓存
    const cachedData = localStorage.getItem('followerHistory')
    const cacheTimestamp = localStorage.getItem('followerHistoryTimestamp')
    const today = dayjs().startOf('day').valueOf()

    // 如果缓存存在且未过期（到当天0时）
    if (cachedData && cacheTimestamp && parseInt(cacheTimestamp) >= today) {
      followerHistory.value = JSON.parse(cachedData)
      return
    }

    isLoadingFollowerHistory.value = true

    // 调用接口获取数据
    const response = await anchorService.queryFollowerHistory({
      biliId: LIKO_INFO.uid,
      cntDate: dayjs().format('YYYY-MM-DD'),
    })

    if (response.data) {
      followerHistory.value = response.data

      // 缓存数据到本地，设置过期时间为当天0时
      localStorage.setItem('followerHistory', JSON.stringify(response.data))
      localStorage.setItem('followerHistoryTimestamp', today.toString())
    }
  } catch (error) {
    console.error('获取粉丝数历史失败:', error)
  } finally {
    isLoadingFollowerHistory.value = false
  }
}

// 加载直播时长历史数据
const loadLiveDurationHistory = async () => {
  if (isLoadingLiveDurationHistory.value) return

  try {
    // 检查本地缓存
    const cachedData = localStorage.getItem('liveDurationHistory')
    const cacheTimestamp = localStorage.getItem('liveDurationHistoryTimestamp')
    const today = dayjs().startOf('day').valueOf()

    // 如果缓存存在且未过期（到当天0时）
    if (cachedData && cacheTimestamp && parseInt(cacheTimestamp) >= today) {
      liveDurationHistory.value = JSON.parse(cachedData)
      return
    }

    isLoadingLiveDurationHistory.value = true

    // 调用接口获取数据
    const response = await anchorService.queryLiveDurationHistory(
      LIKO_INFO.roomId,
      dayjs().format('YYYY-MM-DD'),
    )

    if (response.data) {
      liveDurationHistory.value = response.data

      // 缓存数据到本地，设置过期时间为当天0时
      localStorage.setItem('liveDurationHistory', JSON.stringify(response.data))
      localStorage.setItem('liveDurationHistoryTimestamp', today.toString())
    }
  } catch (error) {
    console.error('获取直播时长历史失败:', error)
  } finally {
    isLoadingLiveDurationHistory.value = false
  }
}

onMounted(async () => {
  // 计算出道天数
  daysSinceDebut.value = calculateDaysSinceDebut()

  // 获取粉丝数
  try {
    const today = new Date().toISOString().split('T')[0] || ''
    const response = await anchorService.queryFollowerNum({
      biliId: LIKO_INFO.uid,
      cntDate: today,
    })
    followerNum.value = response.data || 0
  } catch (error) {
    console.error('获取粉丝数失败:', error)
    followerNum.value = 7681 // 失败时使用默认值
  }

  // 加载历史数据
  await loadFollowerHistory()
  await loadLiveDurationHistory()
})
</script>

<style scoped>
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

.animate-fade-in-delay-800 {
  animation: fadeIn 1s ease-out 0.8s forwards;
  opacity: 0;
}
</style>