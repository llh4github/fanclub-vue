<template>
  <section id="timeline" class="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-card/30">
    <div class="max-w-5xl mx-auto" ref="sectionRef">
      <div class="text-center mb-16" :class="{ 'animate-fade-in': isInView }">
        <div class="inline-block mb-4">
          <span
            class="text-sm tracking-[0.3em] text-[#DF7623] border border-[#DF7623]/30 px-4 py-1 clip-corner"
          >
            TIMELINE
          </span>
        </div>
        <h2 class="text-3xl sm:text-5xl mb-6">成长历程</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">每一步都值得铭记</p>
      </div>

      <div class="relative">
        <!-- Timeline Line -->
        <div
          class="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#DF7623] via-[#00f5ff] to-transparent"
        ></div>

        <div class="space-y-12">
          <div
            v-for="(milestone, index) in milestones"
            :key="index"
            class="relative flex items-center gap-8"
            :class="[
              index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse',
              isInView ? 'animate-fade-in-side-' + (index % 2 === 0 ? 'left' : 'right') : '',
            ]"
            :style="{ animationDelay: `${index * 0.15}s` }"
          >
            <!-- Year Circle -->
            <div
              class="absolute left-8 sm:left-1/2 -translate-x-1/2 flex items-center justify-center"
            >
              <div
                class="w-16 h-16 border-4 clip-corner flex items-center justify-center bg-background relative z-10"
                :style="{ borderColor: getStatusColor(milestone.status) }"
              >
                <Calendar class="w-6 h-6" :style="{ color: getStatusColor(milestone.status) }" />
              </div>
            </div>

            <!-- Content -->
            <div
              class="flex-1"
              :class="[index % 2 === 0 ? 'sm:text-right sm:pr-16' : 'sm:pl-16', 'pl-24 sm:pl-0']"
            >
              <div
                class="bg-card border border-border p-6 clip-corner hover:border-[#DF7623]/50 transition-all duration-300"
              >
                <div
                  class="flex items-center gap-3 mb-3"
                  :class="[index % 2 === 0 ? 'sm:justify-end' : '']"
                >
                  <span
                    class="text-2xl font-bold"
                    :style="{ color: getStatusColor(milestone.status) }"
                  >
                    {{ milestone.date }}
                  </span>
                  <span
                    class="text-xs px-2 py-1 border clip-corner-xs"
                    :style="{
                      borderColor: getStatusColor(milestone.status),
                      color: getStatusColor(milestone.status),
                    }"
                  >
                    {{ getStatusText(milestone.status) }}
                  </span>
                </div>
                <h3 class="mb-2">{{ milestone.title }}</h3>
                <p class="text-sm text-muted-foreground">
                  {{ milestone.description }}
                </p>
              </div>
            </div>

            <!-- Spacer for desktop -->
            <div class="hidden sm:block flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar } from 'lucide-vue-next'

const sectionRef = ref<HTMLElement | null>(null)
const isInView = ref(false)

interface Milestone {
  date: string // 格式：YYYY-MM-DD
  title: string
  description: string
  status: 'upcoming' | 'ongoing' | 'completed'
}

const milestones: Milestone[] = [
  {
    date: '2026-08-03',
    title: '莉蔻生日',
    description: '庆祝莉蔻的生日',
    status: 'upcoming',
  },
  {
    date: '2026-01-22',
    title: '百舰',
    description: '首次百舰',
    status: 'completed',
  },
  {
    date: '2026-01-14',
    title: '堂堂出道',
    description: '正式出道',
    status: 'completed',
  },
]

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return '#00f5ff'
    case 'ongoing':
      return '#DF7623'
    case 'completed':
      return '#8a8a9e'
    default:
      return '#8a8a9e'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return '即将到来'
    case 'ongoing':
      return '进行中'
    case 'completed':
      return '已完成'
    default:
      return ''
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
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

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease forwards;
}

.animate-fade-in-side-left {
  opacity: 0;
  animation: fadeInLeft 0.6s ease forwards;
}

.animate-fade-in-side-right {
  opacity: 0;
  animation: fadeInRight 0.6s ease forwards;
}
</style>
