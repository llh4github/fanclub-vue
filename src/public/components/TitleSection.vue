<template>
  <div class="text-center">
    <h1
      class="text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tight relative"
      :class="{ 'animate-fade-in-delay-200': true }"
    >
      <div class="relative">
        <span class="text-foreground">莉蔻</span>
        <span class="text-[#DF7623] ml-2 glow-text">Liko</span>
      </div>
    </h1>

    <div
      class="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto flex items-center gap-2"
      :class="{ 'animate-fade-in-delay-400': true }"
    >
      <div class="text-2xl sm:text-3xl font-bold">{</div>
      <div class="flex flex-col">
        <div>16岁的侏儒兔，是见习杀手</div>
        <div class="h-7 sm:h-8 overflow-hidden">
          <transition name="flip-up" mode="out-in">
            <div
              :key="dynamicText"
              class="transition-all duration-500 cursor-pointer hover:text-[#00f5ff]"
              @click="handleQuoteClick"
            >
              “{{ dynamicText.trim() }}”
            </div>
          </transition>
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-bold">}</div>
    </div>

    <div
      class="mb-3 flex items-center justify-center gap-2 px-4 py-2 bg-card border border-[#DF7623]/30 clip-corner"
      :class="{ 'animate-fade-in': true }"
    >
      <Users class="w-4 h-4 text-[#00f5ff]" />
      <span class="text-sm tracking-wider">UNOFFICIAL FANSITE</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Users } from 'lucide-vue-next'
import likoCsv from '@/assets/texts/liko.csv?raw'

// 动态文本相关
interface LikoQuote {
  content: string
  bv: string
}

const dynamicText = ref<string>('')
const currentQuote = ref<LikoQuote | null>(null)
const quotes = ref<LikoQuote[]>([])
let textInterval: ReturnType<typeof setInterval> | null = null

// Fisher-Yates 洗牌算法
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}

// 解析 CSV 数据
const parseCsv = (csv: string): LikoQuote[] => {
  // 移除 BOM 头
  const cleanCsv = csv.replace(/^\ufeff/, '')
  const lines = cleanCsv.split('\n').filter((line) => line.trim() !== '')

  if (lines.length === 0) {
    return []
  }

  const headers = lines[0]?.split(',').map((header) => header.trim()) || []

  const contentIndex = headers.indexOf('content')
  const bvIndex = headers.indexOf('bv')

  if (contentIndex === -1 || bvIndex === -1) {
    return []
  }

  const quotes = lines
    .slice(1)
    .map((line) => {
      const values = line.split(',')
      return {
        content: values[contentIndex]?.trim() || '',
        bv: values[bvIndex]?.trim() || '',
      }
    })
    .filter((quote) => quote.content && quote.bv)

  return quotes
}

// 处理点击跳转
const handleQuoteClick = () => {
  if (currentQuote.value?.bv) {
    window.open(
      `https://www.bilibili.com/video/${currentQuote.value.bv}`,
      '_blank',
      'noopener,noreferrer',
    )
  }
}

// 初始化动态文本轮换
const initDynamicText = () => {
  quotes.value = parseCsv(likoCsv)

  if (quotes.value.length === 0) {
    dynamicText.value = '加载中...'
    return
  }

  const shuffledQuotes = shuffleArray(quotes.value)
  let currentIndex = 0

  // 设置初始文本
  currentQuote.value = shuffledQuotes[currentIndex]!
  dynamicText.value = currentQuote.value.content

  // 每6秒轮换文本
  textInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % shuffledQuotes.length
    currentQuote.value = shuffledQuotes[currentIndex]!
    dynamicText.value = currentQuote.value.content
  }, 30 * 1000)
}

onMounted(() => {
  // 初始化动态文本
  initDynamicText()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (textInterval) {
    clearInterval(textInterval)
  }
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

.flip-up-enter-active,
.flip-up-leave-active {
  transition: all 0.5s ease;
}

.flip-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.flip-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
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
</style>
