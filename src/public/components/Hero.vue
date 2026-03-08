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
    </div>

    <div class="max-w-5xl mx-auto text-center relative z-10">
      <!-- 圆形头像框 -->
      <div class="relative w-36 h-36 mx-auto mb-6" :class="{ 'animate-fade-in-delay-100': true }">
        <div
          class="absolute inset-0 rounded-full bg-gradient-to-r from-[#DF7623] via-amber-400 to-[#DF7623] animate-spin-slow opacity-70"
        ></div>
        <div
          class="absolute inset-1 rounded-full bg-[#1a1a2e] overflow-hidden border border-gray-700"
        >
          <img :src="randomAvatar" alt="莉蔻" class="w-full h-full object-cover" />
        </div>
        <!-- 气泡对话框 -->
        <transition name="bubble">
          <div v-show="showBubble" class="absolute -top-12 -right-12 bg-white border-2 border-white px-4 py-2 clip-corner">
            <span class="text-[#DF7623] font-bold">蒄爆VR</span>
            <div class="absolute bottom-0 right-4 w-0 h-0 border-l-8px border-r-8px border-t-8px border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        </transition>
      </div>

      <h1
        class="text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tight relative"
        :class="{ 'animate-fade-in-delay-200': true }"
      >
      <div class="relative">
        <!-- 弹孔图标 -->
        <svg 
          class="absolute -top-4 -left-4 w-12 h-12 text-gray-500 opacity-0 transform scale-0 rotate-45" 
          :class="{ 'animate-bullet-hole-entry': showBulletHole }"
          xmlns="http://www.w3.org/2000/svg" 
          width="512" 
          height="512" 
          viewBox="0 0 512 512"
        >
          <path fill="currentColor" d="M105.4 26.28C122.1 96.08 82.98 121 27 132.6c70.72 24.3 36.69 48.4 21.99 72.6c66.01-5.1 87.51 25.8 87.41 74.3c36.5-20.1 51.6-62.3 147.1-21.6c-23.4-43.1-31.9-75.3 20.3-118.5c-39.7-14.2-77-30.2-58.1-81.17c-56.3 37.85-98.9 5.52-140.3-31.95m66.9 67.89a62.23 62.23 0 0 1 62.2 62.23a62.23 62.23 0 0 1-62.2 62.2a62.23 62.23 0 0 1-62.2-62.2a62.23 62.23 0 0 1 62.2-62.23M318.9 218.2c17.3 81.3-25 98-89 91.2c30.9 31.9 50.2 68 16.1 123.1c45.3-11.2 88.5-13.6 113.9 49.8c22.5-46.1 64.8-52.4 116.7-38.7c-17.9-27.7-38-55.4 16.9-82.8c-37-25.5-74.3-50.7-49.4-124.5c-45.3 51-86.7 40.1-125.2-18.1m47.4 76.7a62.23 62.23 0 0 1 62.2 62.2a62.23 62.23 0 0 1-62.2 62.2a62.23 62.23 0 0 1-62.2-62.2a62.23 62.23 0 0 1 62.2-62.2"/>
        </svg>
        
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
        <button
          @click="scrollToSection('works')"
          class="px-8 py-4 bg-[#DF7623] hover:bg-[#DF7623]/90 text-white relative overflow-hidden group clip-corner transition-all"
        >
          <span class="relative z-10 flex items-center gap-2">
            <span class="inline-block text-white animate-pulse">
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
            直播中
          </span>
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
          ></div>
        </button>

        <button
          @click="scrollToSection('fanzone')"
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
          <DollarSign class="w-5 h-5 text-[#DF7623] fill-current" />
          <span class="text-sm text-muted-foreground">
            身价：
          <n-number-animation :from="0"  :to="7681"  :duration="3000"  />
            蔻萝特
          </span>
        </div>
        <div class="w-px h-4 bg-border"></div>
        <div class="flex items-center gap-2">
          <Calendar class="w-5 h-5 text-[#00f5ff]" />
          <span class="text-sm text-muted-foreground"
            >已出道 <n-number-animation :from="0" :to="daysSinceDebut" :duration="3000" /> 天</span
          >
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
import { ref, onMounted } from 'vue'
import { DollarSign, ArrowDown, Users, Calendar } from 'lucide-vue-next'
import { NNumberAnimation } from 'naive-ui';
import avatarA from '@/assets/avatar/avatar_a.webp'
import avatarKu from '@/assets/avatar/avatar_ku.webp'
import avatarXiao from '@/assets/avatar/avatar_xiao.webp'

// 控制弹孔图标的入场动画
const showBulletHole = ref(false);
// 控制气泡对话框的显示和隐藏
const showBubble = ref(false);

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const randomAvatar = ref<string>(avatarA as string)
const daysSinceDebut = ref<number>(0)

const calculateDaysSinceDebut = () => {
  const debutDate = new Date('2026-01-14')
  const today = new Date()
  const timeDiff = today.getTime() - debutDate.getTime()
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
  return daysDiff
}

onMounted(() => {
  // 随机选择头像
  const avatars = [avatarA, avatarKu, avatarXiao];
  randomAvatar.value = avatars[Math.floor(Math.random() * avatars.length)] as string;
  
  // 计算出道天数
  daysSinceDebut.value = calculateDaysSinceDebut();
  
  // 5秒后触发弹孔图标的入场动画
  setTimeout(() => {
    showBulletHole.value = true;
  }, 5000);
  
  // 3秒后显示气泡对话框
  setTimeout(() => {
    showBubble.value = true;
  }, 3000);
  
  // 6秒后隐藏气泡对话框
  setTimeout(() => {
    showBubble.value = false;
  }, 6000);
});
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

/* 弹孔图标入场动画 */
@keyframes bullet-hole-entry {
  0% {
    opacity: 0;
    transform: scale(0) rotate(45deg);
  }
  30% {
    opacity: 1;
    transform: scale(2) rotate(0deg);
    filter: drop-shadow(0 0 20px #6b7280);
  }
  50% {
    transform: scale(1.5) rotate(-15deg);
  }
  70% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    opacity: 0.7;
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 10px #6b7280);
  }
}

.animate-bullet-hole-entry {
  animation: bullet-hole-entry 1.5s ease-out forwards;
}

/* 气泡对话框过渡动画 */
.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.5s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: scale(0) translateY(20px);
}
</style>
