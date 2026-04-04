<template>
  <section id="works" class="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <div class="absolute inset-0">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-[#DF7623]/5 blur-[120px] rounded-full"></div>
      <div
        class="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00f5ff]/5 blur-[120px] rounded-full"
      ></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10" ref="sectionRef">
      <div class="text-center mb-16" :class="{ 'animate-fade-in': isInView }">
        <div class="inline-block mb-4">
          <span
            class="text-sm tracking-[0.3em] text-[#DF7623] border border-[#DF7623]/30 px-4 py-1 clip-corner"
          >
            WORKS
          </span>
        </div>
        <h2 class="text-3xl sm:text-5xl mb-6">音乐作品</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">用音乐传递情感，用旋律讲述故事</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(work, index) in works"
          :key="index"
          class="bg-card border border-border p-6 clip-corner group hover:border-[#DF7623]/50 transition-all duration-300 relative overflow-hidden"
          :class="[
            isInView ? 'animate-fade-in-delay' : '',
            isInView ? 'animate-delay-' + index * 100 : '',
          ]"
        >
          <div class="flex items-start justify-between mb-6">
            <div
              class="w-16 h-16 flex items-center justify-center border-2 clip-corner-sm"
              :style="{ borderColor: work.color }"
            >
              <component :is="work.icon" class="w-8 h-8" :style="{ color: work.color }" />
            </div>
            <div class="text-right">
              <span
                class="text-[10px] tracking-wider px-2 py-1 border clip-corner-xs block mb-1"
                :style="{ borderColor: work.color, color: work.color }"
              >
                {{ work.status }}
              </span>
              <span class="text-xs text-muted-foreground">{{ work.year }}</span>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <h3>{{ work.title }}</h3>
              <span class="text-xs text-muted-foreground">· {{ work.type }}</span>
            </div>
            <p class="text-sm text-muted-foreground leading-relaxed">
              {{ work.description }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="(tag, tagIndex) in work.tags"
              :key="tagIndex"
              class="text-xs px-2 py-1 bg-secondary text-foreground/80"
            >
              {{ tag }}
            </span>
          </div>

          <button
            class="flex items-center gap-2 text-sm hover:text-[#DF7623] transition-colors"
            :style="{ color: work.color }"
          >
            <ExternalLink class="w-4 h-4" />
            <span>了解更多</span>
          </button>

          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            :style="{
              background: `linear-gradient(135deg, transparent 0%, ${work.color}10 100%)`,
            }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Play, Disc, Film, ExternalLink } from 'lucide-vue-next'

const sectionRef = ref<HTMLElement | null>(null)
const isInView = ref(false)

interface Work {
  icon: any
  title: string
  type: string
  description: string
  tags: string[]
  color: string
  status: string
  year: string
}

const works: Work[] = [
  {
    icon: Disc,
    title: 'CYBER DREAMS',
    type: '专辑',
    description: '融合电子音乐与流行元素的全新专辑，探索未来音乐的可能性',
    tags: ['电子流行', '实验音乐', '10首歌曲'],
    color: '#DF7623',
    status: '即将发布',
    year: '2026',
  },
  {
    icon: Play,
    title: '星光之路',
    type: '单曲',
    description: '描绘追梦旅程的励志单曲，MV点击量突破5000万',
    tags: ['流行', 'MV', '热门单曲'],
    color: '#00f5ff',
    status: '播放中',
    year: '2025',
  },
  {
    icon: Film,
    title: '未来回响',
    type: '音乐纪录片',
    description: '记录音乐创作过程与巡演幕后的纪录片作品',
    tags: ['纪录片', '60分钟', '幕后花絮'],
    color: '#ff4757',
    status: '已上映',
    year: '2025',
  },
  {
    icon: Disc,
    title: '启程',
    type: '专辑',
    description: '首张个人专辑，收录12首原创歌曲，记录音乐梦想的起点',
    tags: ['流行', '原创', '12首歌曲'],
    color: '#DF7623',
    status: '已发布',
    year: '2023',
  },
  {
    icon: Play,
    title: '夜空中最亮的星',
    type: '单曲',
    description: '出道代表作，温暖治愈的旋律打动无数听众',
    tags: ['抒情', '治愈', '代表作'],
    color: '#00f5ff',
    status: '播放中',
    year: '2022',
  },
  {
    icon: Film,
    title: '音乐会实录',
    type: '演唱会',
    description: '首场个人演唱会完整实录，重温现场精彩瞬间',
    tags: ['演唱会', '现场', '2小时'],
    color: '#ff4757',
    status: '回放中',
    year: '2024',
  },
]

const observer = new IntersectionObserver(
  (entries) => {
    const entry = entries[0]
    if (entry && entry.isIntersecting) {
      isInView.value = true
    }
  },
  { threshold: 0.1 },
)

onMounted(() => {
  if (sectionRef.value) {
    observer.observe(sectionRef.value)
  }
})

onUnmounted(() => {
  if (sectionRef.value) {
    observer.unobserve(sectionRef.value)
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

.clip-corner-sm {
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}

.clip-corner-xs {
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
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
  animation: fadeIn 0.6s ease forwards;
}

.animate-fade-in-delay {
  opacity: 0;
  transform: translateY(30px);
}

.animate-delay-0 {
  animation: fadeIn 0.6s ease 0s forwards;
}

.animate-delay-100 {
  animation: fadeIn 0.6s ease 0.1s forwards;
}

.animate-delay-200 {
  animation: fadeIn 0.6s ease 0.2s forwards;
}

.animate-delay-300 {
  animation: fadeIn 0.6s ease 0.3s forwards;
}

.animate-delay-400 {
  animation: fadeIn 0.6s ease 0.4s forwards;
}

.animate-delay-500 {
  animation: fadeIn 0.6s ease 0.5s forwards;
}
</style>
