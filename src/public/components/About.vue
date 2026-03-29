<template>
  <section id="about" class="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
    <div class="absolute inset-0 grid-background"></div>

    <div class="max-w-7xl mx-auto relative z-10" ref="sectionRef">
      <div class="text-center mb-16">
        <div class="inline-block mb-4">
          <span
            class="text-sm tracking-[0.3em] text-[#DF7623] border border-[#DF7623]/30 px-4 py-1 clip-corner"
          >
            TRAINING
          </span>
        </div>
        <h2 class="text-3xl sm:text-5xl mb-6">训练纪录</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          记录莉蔻的训练历程与成长轨迹，见证从见习杀手到顶级偶像的蜕变之路。
          每一次训练都是一次突破，每一次努力都为梦想添砖加瓦。
        </p>
      </div>

      <div class="flex items-center gap-6 lg:gap-8">
        <!-- 左侧全身照 -->
        <div class="hidden md:block flex-shrink-0 w-64 lg:w-80">
          <img
            src="@/assets/fullbody/full-body-1.avif"
            alt="莉蔻全身照"
            class="w-full h-full object-cover clip-corner border border-border"
          />
        </div>

        <!-- 视频轮播区域 -->
        <div class="flex-1 relative">
          <div class="relative overflow-hidden bg-card border border-border p-6 clip-corner">
            <!-- 轮播容器 -->
            <div
              class="carousel-container relative aspect-video overflow-hidden clip-corner-sm mb-6"
              ref="carouselContainer"
            >
              <div
                class="carousel-track flex transition-transform duration-500 ease-in-out h-full"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
              >
                <!-- 轮播项 -->
                <div
                  v-for="(video, index) in videos"
                  :key="index"
                  class="carousel-item flex-shrink-0 w-full h-full"
                  ref="el => el && videoRefs.value.push(el)"
                >
                  <iframe
                    ref="el => el && videoIframes.value.push(el)"
                    :src="video.src"
                    scrolling="no"
                    border="0"
                    frameborder="no"
                    framespacing="0"
                    allowfullscreen="true"
                    allow="autoplay"
                    class="w-full h-full"
                  >
                  </iframe>
                </div>
              </div>
            </div>

            <!-- 轮播导航 -->
            <div class="flex justify-center gap-2 mb-4">
              <button
                v-for="(video, index) in videos"
                :key="index"
                class="w-3 h-3 rounded-full transition-all"
                :class="currentSlide === index ? 'bg-[#DF7623] w-8' : 'bg-border'"
                @click="goToSlide(index)"
              ></button>
            </div>

            <!-- 轮播控制按钮 -->
            <div class="flex justify-between items-center">
              <button
                class="w-10 h-10 flex items-center justify-center border border-[#DF7623] clip-corner hover:bg-[#DF7623]/10 transition-colors"
                @click="prevSlide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-chevron-left"
                  style="color: #df7623"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <div class="text-center">
                <h3 class="text-lg font-bold">{{ videos[currentSlide]?.title || '' }}</h3>
                <p class="text-sm text-muted-foreground">
                  {{ videos[currentSlide]?.description || '' }}
                </p>
              </div>

              <button
                class="w-10 h-10 flex items-center justify-center border border-[#DF7623] clip-corner hover:bg-[#DF7623]/10 transition-colors"
                @click="nextSlide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-chevron-right"
                  style="color: #df7623"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧全身照 -->
        <div class="hidden md:block flex-shrink-0 w-64 lg:w-80">
          <img
            src="@/assets/fullbody/full-body-2.avif"
            alt="莉蔻全身照"
            class="w-full h-full object-cover clip-corner border border-border"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)
const videoRefs = ref<HTMLElement[]>([])
const videoIframes = ref<HTMLIFrameElement[]>([])
const carouselContainer = ref<HTMLElement | null>(null)

// 轮播状态
const currentSlide = ref(0)

// 视频数据
const videos = [
  {
    src: '//player.bilibili.com/player.html?bvid=BV1iyZwBVESt&page=1&muted=1',
    title: '训练视频 1',
    description: '莉蔻的日常训练记录',
  },
  {
    src: '//player.bilibili.com/player.html?bvid=BV1S5f6B3E64&page=1&muted=1',
    title: '训练视频 2',
    description: '舞台表演练习',
  },
  {
    src: '//player.bilibili.com/player.html?bvid=BV1cdfnBkEvf&page=1&muted=1',
    title: '训练视频 3',
    description: 'vocal 练习',
  },
  {
    src: '//player.bilibili.com/player.html?bvid=BV1iwNwztEjZ&page=1&muted=1',
    title: '训练视频 4',
    description: '舞蹈练习',
  },
]

// 轮播方法
const goToSlide = (index: number) => {
  currentSlide.value = index
  // 停止当前视频
  stopCurrentVideo()
  // 播放新视频
  playCurrentVideo()
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % videos.length
  // 停止当前视频
  stopCurrentVideo()
  // 播放新视频
  playCurrentVideo()
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + videos.length) % videos.length
  // 停止当前视频
  stopCurrentVideo()
  // 播放新视频
  playCurrentVideo()
}

// 播放当前视频
const playCurrentVideo = () => {
  const iframe = videoIframes.value[currentSlide.value]
  if (iframe) {
    iframe.contentWindow?.postMessage(
      JSON.stringify({
        cmd: 'play',
      }),
      '*',
    )
  }
}

// 停止当前视频
const stopCurrentVideo = () => {
  const iframe = videoIframes.value[currentSlide.value]
  if (iframe) {
    iframe.contentWindow?.postMessage(
      JSON.stringify({
        cmd: 'pause',
      }),
      '*',
    )
  }
}

// 检测视频是否进入视口
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 播放当前视频
        playCurrentVideo()
      }
    })
  },
  { threshold: 0.5 },
)

onMounted(() => {
  // 观察轮播容器
  if (carouselContainer.value) {
    observer.observe(carouselContainer.value)
  }
})

onUnmounted(() => {
  // 清理观察器
  if (carouselContainer.value) {
    observer.unobserve(carouselContainer.value)
  }
  observer.disconnect()
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

.clip-corner-sm {
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}

.grid-background {
  background-image:
    linear-gradient(rgba(223, 118, 35, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(223, 118, 35, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black, transparent 80%);
}
</style>
