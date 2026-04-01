<template>
  <section class="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8">
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-radial from-[#DF7623]/10 via-transparent to-transparent"
      ></div>
      <div class="absolute top-20 left-10 w-64 h-64 bg-[#00f5ff]/5 blur-[100px] rounded-full"></div>
      <div
        class="absolute bottom-20 right-10 w-64 h-64 bg-[#DF7623]/5 blur-[100px] rounded-full"
      ></div>
      <ThreeScrollingText :isLive="liveStatus.status === 'LIVING'" />
    </div>

    <div class="max-w-5xl mx-auto text-center relative z-10">
      <!-- 圆形头像框 -->
      <div
        class="relative w-36 h-36 mx-auto mb-6 z-10"
        :class="{ 'animate-fade-in-delay-100': true }"
      >
        <div
          class="absolute inset-0 rounded-full bg-gradient-to-r from-[#DF7623] via-amber-400 to-[#DF7623] animate-spin-slow opacity-70"
        ></div>
        <div
          class="absolute inset-1 rounded-full bg-[#1a1a2e] overflow-hidden border border-gray-700"
        >
          <img :src="randomAvatar" alt="莉蔻" class="w-full h-full object-cover" />
        </div>
      </div>

      <h1
        class="text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tight relative"
        :class="{ 'animate-fade-in-delay-200': true }"
      >
        <div class="relative">
          <span class="text-foreground">莉蔻</span>
          <span class="text-[#DF7623] ml-2 glow-text">Liko</span>
        </div>
      </h1>

      <p
        class="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
        :class="{ 'animate-fade-in-delay-400': true }"
      >
        &#123; 16岁的侏儒兔，是见习杀手 &#125;
      </p>
      <div
        class="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-card border border-[#DF7623]/30 clip-corner"
        :class="{ 'animate-fade-in': true }"
      >
        <Users class="w-4 h-4 text-[#00f5ff]" />
        <span class="text-sm tracking-wider">UNOFFICIAL FANSITE</span>
      </div>
      <div
        class="flex flex-col sm:flex-row gap-4 justify-center items-center"
        :class="{ 'animate-fade-in-delay-600': true }"
      >
        <NTooltip
          v-if="liveStatus.status !== 'LIVING' && liveStatus.liveTime"
          placement="top"
          trigger="hover"
        >
          <template #trigger>
            <button
              @click="openLivePage()"
              :class="{
                'px-8 py-4 text-white relative overflow-hidden group clip-corner transition-all': true,
                'bg-[#DF7623] hover:bg-[#DF7623]/90': liveStatus.status === 'LIVING',
                'bg-gray-600 hover:bg-gray-500': liveStatus.status !== 'LIVING',
              }"
            >
              <span class="relative z-10 flex items-center gap-2">
                <span
                  v-if="liveStatus.status === 'LIVING'"
                  class="inline-block text-white animate-pulse"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="0" fill="currentColor">
                      <animate
                        id="SVGHRb9bJhy"
                        fill="freeze"
                        attributeName="r"
                        begin="0;SVGUoIUme6Z.begin+0.4s"
                        calcMode="spline"
                        dur="1.2s"
                        keySplines=".52,.6,.25,.99"
                        values="0;11"
                      />
                      <animate
                        fill="freeze"
                        attributeName="opacity"
                        begin="0;SVGUoIUme6Z.begin+0.4s"
                        calcMode="spline"
                        dur="1.2s"
                        keySplines=".52,.6,.25,.99"
                        values="1;0"
                      />
                    </circle>
                    <circle cx="12" cy="12" r="0" fill="currentColor">
                      <animate
                        id="SVGaun8abat"
                        fill="freeze"
                        attributeName="r"
                        begin="SVGHRb9bJhy.begin+0.4s"
                        calcMode="spline"
                        dur="1.2s"
                        keySplines=".52,.6,.25,.99"
                        values="0;11"
                      />
                      <animate
                        fill="freeze"
                        attributeName="opacity"
                        begin="SVGHRb9bJhy.begin+0.4s"
                        calcMode="spline"
                        dur="1.2s"
                        keySplines=".52,.6,.25,.99"
                        values="1;0"
                      />
                    </circle>
                    <circle cx="12" cy="12" r="0" fill="currentColor">
                      <animate
                        id="SVGUoIUme6Z"
                        fill="freeze"
                        attributeName="r"
                        begin="SVGHRb9bJhy.begin+0.8s"
                        calcMode="spline"
                        dur="1.2s"
                        keySplines=".52,.6,.25,.99"
                        values="0;11"
                      />
                      <animate
                        fill="freeze"
                        attributeName="opacity"
                        begin="SVGHRb9bJhy.begin+0.8s"
                        calcMode="spline"
                        dur="1.2s"
                        keySplines=".52,.6,.25,.99"
                        values="1;0"
                      />
                    </circle>
                  </svg>
                </span>
                <template v-if="liveStatus.status === 'LIVING'">
                  直播中
                  <span v-if="liveDuration > 0" class="text-sm opacity-90"
                    >({{ formatDuration(liveDuration) }})</span
                  >
                </template>
                <template v-else> 未直播 </template>
              </span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
              ></div>
            </button>
          </template>
          <div class="text-xs">
            <div v-if="liveStatus.liveTime">上次直播：{{ formatLiveTime(liveStatus.liveTime) }}</div>
            <div v-if="liveStatus.liveDuration">
              直播时长：{{ formatLiveDuration(liveStatus.liveDuration) }}
            </div>
          </div>
        </NTooltip>
        <button
          v-else
          @click="openLivePage()"
          :class="{
            'px-8 py-4 text-white relative overflow-hidden group clip-corner transition-all': true,
            'bg-[#DF7623] hover:bg-[#DF7623]/90': liveStatus.status === 'LIVING',
            'bg-gray-600 hover:bg-gray-500': liveStatus.status !== 'LIVING',
          }"
        >
          <span class="relative z-10 flex items-center gap-2">
            <span
              v-if="liveStatus.status === 'LIVING'"
              class="inline-block text-white animate-pulse"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="0" fill="currentColor">
                  <animate
                    id="SVGHRb9bJhy"
                    fill="freeze"
                    attributeName="r"
                    begin="0;SVGUoIUme6Z.begin+0.4s"
                    calcMode="spline"
                    dur="1.2s"
                    keySplines=".52,.6,.25,.99"
                    values="0;11"
                  />
                  <animate
                    fill="freeze"
                    attributeName="opacity"
                    begin="0;SVGUoIUme6Z.begin+0.4s"
                    calcMode="spline"
                    dur="1.2s"
                    keySplines=".52,.6,.25,.99"
                    values="1;0"
                  />
                </circle>
                <circle cx="12" cy="12" r="0" fill="currentColor">
                  <animate
                    id="SVGaun8abat"
                    fill="freeze"
                    attributeName="r"
                    begin="SVGHRb9bJhy.begin+0.4s"
                    calcMode="spline"
                    dur="1.2s"
                    keySplines=".52,.6,.25,.99"
                    values="0;11"
                  />
                  <animate
                    fill="freeze"
                    attributeName="opacity"
                    begin="SVGHRb9bJhy.begin+0.4s"
                    calcMode="spline"
                    dur="1.2s"
                    keySplines=".52,.6,.25,.99"
                    values="1;0"
                  />
                </circle>
                <circle cx="12" cy="12" r="0" fill="currentColor">
                  <animate
                    id="SVGUoIUme6Z"
                    fill="freeze"
                    attributeName="r"
                    begin="SVGHRb9bJhy.begin+0.8s"
                    calcMode="spline"
                    dur="1.2s"
                    keySplines=".52,.6,.25,.99"
                    values="0;11"
                  />
                  <animate
                    fill="freeze"
                    attributeName="opacity"
                    begin="SVGHRb9bJhy.begin+0.8s"
                    calcMode="spline"
                    dur="1.2s"
                    keySplines=".52,.6,.25,.99"
                    values="1;0"
                  />
                </circle>
              </svg>
            </span>
            <template v-if="liveStatus.status === 'LIVING'">
              直播中
              <span v-if="liveDuration > 0" class="text-sm opacity-90"
                >({{ formatDuration(liveDuration) }})</span
              >
            </template>
            <template v-else> 未直播 </template>
          </span>
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
          ></div>
        </button>

        <button
          @click="openBilibiliPage()"
          class="px-8 py-4 border-2 border-[#DF7623] text-[#DF7623] hover:bg-[#DF7623]/10 clip-corner transition-all"
        >
          B站主页
        </button>
      </div>

      <div
        class="mt-12 flex items-center justify-center gap-6"
        :class="{ 'animate-fade-in-delay-800': true }"
      >
        <div class="flex items-center gap-2">
          <div
            class="follwer-num-info flex items-center gap-1 relative group cursor-pointer"
            @mouseenter="handleFollowerInfoHover(true)"
            @mouseleave="handleFollowerInfoHover(false)"
          >
            <span class="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-[#DF7623] transition-colors cursor-pointer">
              <DollarSign class="w-5 h-5 text-[#DF7623] fill-current group-hover:scale-110 transition-transform" />
              身价：
              <n-number-animation :from="0" :to="followerNum" :duration="3000" />
              蔻萝特
            </span>
            <!-- 悬停时显示的图表 -->
            <div
              v-if="showFollowerChart"
              class="absolute top-full left-0 mt-2 w-80 h-60 bg-card border border-border rounded-lg shadow-lg p-4 z-50"
              @mouseenter="handleFollowerInfoHover(true)"
              @mouseleave="handleFollowerInfoHover(false)"
            >
              <v-chart class="w-full h-full" :option="followerChartOption" />
            </div>
          </div>
        </div>
        <div class="w-px h-4 bg-border"></div>
        <div class="flex items-center gap-2 group">
          <span class="text-sm text-muted-foreground flex items-center gap-2 group-hover:text-[#00f5ff] transition-colors cursor-pointer">
            <Calendar class="w-5 h-5 text-[#00f5ff] group-hover:scale-110 transition-transform" />
            已出道 <n-number-animation :from="0" :to="daysSinceDebut" :duration="3000" /> 天
          </span>
        </div>
      </div>
    </div>

    <div
      class="absolute bottom-10 left-1/2 -translate-x-1/2"
      :class="{ 'animate-fade-in-delay-1000': true }"
    >
      <ArrowDown class="w-6 h-6 text-[#DF7623] animate-bounce" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { DollarSign, ArrowDown, Users, Calendar } from 'lucide-vue-next'
import { NNumberAnimation, NTooltip } from 'naive-ui'
import { LIKO_INFO } from '@/common/constants/anchor'
import { anchorService, type AnchorFollowerDateNum } from '@/api'
import avatarA from '@/assets/avatar/avatar_a.webp'
import avatarKu from '@/assets/avatar/avatar_ku.webp'
import avatarXiao from '@/assets/avatar/avatar_xiao.webp'
import dayjs from 'dayjs'
import ThreeScrollingText from './ThreeScrollingText.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'

// 注册 ECharts 组件
use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const openBilibiliPage = () => {
  window.open('https://space.bilibili.com/1536601294', '_blank', 'noopener,noreferrer')
}

const openLivePage = () => {
  window.open('https://live.bilibili.com/1713548468', '_blank', 'noopener,noreferrer')
}

const randomAvatar = ref<string>(avatarA as string)
const daysSinceDebut = ref<number>(0)
const followerNum = ref<number>(0)
const liveStatus = ref<{
  status: string
  liveTime?: string
  endLiveTime?: string
  liveDuration?: number
}>({ status: 'UNKNOWN' })
const liveDuration = ref<number>(0)

// 粉丝数历史相关
const showFollowerChart = ref<boolean>(false)
const followerHistory = ref<AnchorFollowerDateNum[]>([])
const isLoadingFollowerHistory = ref<boolean>(false)

// 图表配置
const followerChartOption = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
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
    },
    yAxis: {
      type: 'value',
      min: 6000,
      axisLabel: {
        formatter: '{value}',
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

// 处理鼠标悬停事件
const handleFollowerInfoHover = async (show: boolean) => {
  showFollowerChart.value = show
  if (show && followerHistory.value.length === 0) {
    await loadFollowerHistory()
  }
}

const calculateDaysSinceDebut = () => {
  return dayjs(new Date()).diff(dayjs(LIKO_INFO.debutDate), 'day')
}

const updateLiveDuration = () => {
  if (liveStatus.value.status === 'LIVING' && liveStatus.value.liveTime) {
    const liveStartTime = dayjs(liveStatus.value.liveTime)
    const now = dayjs()
    liveDuration.value = now.diff(liveStartTime, 'second')
  } else {
    liveDuration.value = 0
  }
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化直播时间
const formatLiveTime = (time: string): string => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 格式化直播时长（转换为小时数）
const formatLiveDuration = (seconds: number): string => {
  const hours = (seconds / 3600).toFixed(1)
  return `${hours} 小时`
}

onMounted(async () => {
  // 随机选择头像
  const avatars = [avatarA, avatarKu, avatarXiao]
  randomAvatar.value = avatars[Math.floor(Math.random() * avatars.length)] as string

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

  // 获取直播状态
  try {
    const response = await anchorService.getLiveStatus(LIKO_INFO.roomId)
    if (response.data) {
      liveStatus.value = {
        status: response.data.liveStatus,
        liveTime: response.data.liveTime,
        endLiveTime: response.data.endLiveTime,
        liveDuration: response.data.liveDuration,
      }
    }
  } catch (error) {
    console.error('获取直播状态失败:', error)
  }

  // 每秒更新直播时长
  setInterval(updateLiveDuration, 1000)
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

.glow-text {
  text-shadow:
    0 0 20px rgba(223, 118, 35, 0.5),
    0 0 40px rgba(223, 118, 35, 0.3);
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

.animate-fade-in-delay-200 {
  animation: fadeIn 0.8s ease-out 0.2s forwards;
  opacity: 0;
  transform: translateY(20px);
}

.animate-fade-in-delay-400 {
  animation: fadeIn 0.8s ease-out 0.4s forwards;
  opacity: 0;
  transform: translateY(20px);
}

.animate-fade-in-delay-600 {
  animation: fadeIn 0.8s ease-out 0.6s forwards;
  opacity: 0;
  transform: translateY(20px);
}

.animate-fade-in-delay-800 {
  animation: fadeIn 1s ease-out 0.8s forwards;
  opacity: 0;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-fade-in-delay-100 {
  animation: fadeIn 0.8s ease-out 0.1s forwards;
  opacity: 0;
  transform: translateY(20px);
}

.animate-fade-in-delay-1000 {
  animation: fadeIn 1s ease-out 1s forwards;
  opacity: 0;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
