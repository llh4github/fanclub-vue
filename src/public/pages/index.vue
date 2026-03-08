<template>
  <div class="min-h-screen bg-background text-foreground relative overflow-hidden">
    <!-- 子弹掉落背景元素 -->
    <div class="bullets-container absolute inset-0 z-0">
      <div
        v-for="bullet in bullets"
        :key="bullet.id"
        class="bullet"
        :class="`bullet-${bullet.type}`"
        :style="bullet.style"
      >
        <component :is="bullet.component" />
      </div>
    </div>

    <Navigation />
    <main class="relative z-10">
      <Hero />
      <About />
      <Timeline />
      <Playlist />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Navigation from '../components/Navigation.vue'
import Hero from '../components/Hero.vue'
import About from '../components/About.vue'
import Timeline from '../components/Timeline.vue'
import Playlist from '../components/Playlist.vue'
import Footer from '../components/Footer.vue'

// 导入子弹图标
import IconBullets from '@/common/components/icons/IconBullets.vue'
import IconBulletBill from '@/common/components/icons/IconBulletBill.vue'
import IconTarget from '@/common/components/icons/IconTarget.vue'
import IconCarrot from '@/common/components/icons/IconCarrot.vue'

// 子弹类型
interface Bullet {
  id: number
  type: 'bullets' | 'bullet-bill' | 'target' | 'carrot'
  component: any
  style: { [key: string]: string }
}

// 子弹数组
const bullets = ref<Bullet[]>([])
let bulletId = 0
let bulletInterval: number | undefined

// 生成随机子弹
const createBullet = () => {
  // 随机选择子弹类型
  const types = ['bullets', 'bullet-bill', 'target', 'carrot']
  const randomType = types[Math.floor(Math.random() * types.length)] as
    | 'bullets'
    | 'bullet-bill'
    | 'target'
    | 'carrot'

  // 根据类型选择组件
  let component: any
  switch (randomType) {
    case 'bullets':
      component = IconBullets
      break
    case 'bullet-bill':
      component = IconBulletBill
      break
    case 'target':
      component = IconTarget
      break
    case 'carrot':
      component = IconCarrot
      break
    default:
      component = IconBullets
  }

  // 随机位置和大小
  const left = Math.random() * 100
  const size = 20 + Math.random() * 20

  // 创建子弹
  const bullet: Bullet = {
    id: bulletId++,
    type: randomType,
    component,
    style: {
      left: `${left}%`,
      top: '-50px',
      width: `${size}px`,
      height: `${size}px`,
    },
  }

  bullets.value.push(bullet)

  // 3秒后移除子弹
  setTimeout(() => {
    bullets.value = bullets.value.filter((b) => b.id !== bullet.id)
  }, 3000)
}

// 开始生成子弹
const startBullets = () => {
  // 初始延迟
  setTimeout(() => {
    // 每隔随机时间生成子弹
    const createBulletWithRandomDelay = () => {
      createBullet()
      // 随机延迟 7-17 秒
      const delay = 7000 + Math.random() * 10000
      bulletInterval = window.setTimeout(createBulletWithRandomDelay, delay)
    }

    createBulletWithRandomDelay()
  }, 7000)
}

// 组件挂载时开始生成子弹
onMounted(() => {
  startBullets()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (bulletInterval) {
    clearTimeout(bulletInterval)
  }
})
</script>

<style>
/* 引入字体 */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');

/* 全局样式 */
body {
  font-family: 'JetBrains Mono', monospace;
  background-color: #0a0a0f;
  color: #e5e5e5;
}

h1,
h2,
h3,
h4 {
  font-family: 'Orbitron', sans-serif;
}

/* 子弹容器样式 */
.bullets-container {
  pointer-events: none;
}

/* 子弹样式 */
.bullet {
  position: absolute;
  color: #df7623;
  opacity: 0.6;
  animation: bullet-fall 3s linear forwards;
  filter: drop-shadow(0 0 5px rgba(223, 118, 35, 0.5));
}

.bullet svg {
  width: 100%;
  height: 100%;
}

/* 子弹掉落动画 */
@keyframes bullet-fall {
  0% {
    top: -50px;
    transform: rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    top: 100vh;
    transform: rotate(360deg);
    opacity: 0;
  }
}
</style>
