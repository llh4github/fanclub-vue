<template>
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
      <template #default>
        <div class="text-xs">
          <div v-if="liveStatus.liveTime">上次直播：{{ formatLiveTime(liveStatus.liveTime) }}</div>
          <div v-if="liveStatus.liveDuration">
            直播时长：{{ formatLiveDuration(liveStatus.liveDuration) }}
          </div>
        </div>
      </template>
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
        <span v-if="liveStatus.status === 'LIVING'" class="inline-block text-white animate-pulse">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NTooltip } from 'naive-ui'
import { LIKO_INFO } from '@/common/constants/anchor'
import { anchorService } from '@/api'
import dayjs from 'dayjs'

const emit = defineEmits<{
  (e: 'liveStatusChange', status: string): void
}>()

const openBilibiliPage = () => {
  window.open('https://space.bilibili.com/1536601294', '_blank', 'noopener,noreferrer')
}

const openLivePage = () => {
  window.open('https://live.bilibili.com/1713548468', '_blank', 'noopener,noreferrer')
}

const liveStatus = ref<{
  status: string
  liveTime?: string
  endLiveTime?: string
  liveDuration?: number
}>({ status: 'UNKNOWN' })
const liveDuration = ref<number>(0)

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
      // 发射直播状态变化事件
      emit('liveStatusChange', response.data.liveStatus)
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

.animate-fade-in-delay-600 {
  animation: fadeIn 0.8s ease-out 0.6s forwards;
  opacity: 0;
  transform: translateY(20px);
}
</style>
