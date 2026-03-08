<template>
  <section id="fanzone" class="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-card/30 relative">
    <div class="absolute inset-0 grid-background"></div>

    <div class="max-w-5xl mx-auto relative z-10" ref="sectionRef">
      <div class="text-center mb-16">
        <div class="inline-block mb-4">
          <span
            class="text-sm tracking-[0.3em] text-[#DF7623] border border-[#DF7623]/30 px-4 py-1 clip-corner"
          >
            FAN ZONE
          </span>
        </div>
        <h2 class="text-3xl sm:text-5xl mb-6">粉丝专区</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">因为有你们，音乐才有意义</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div class="bg-card border border-border p-8 clip-corner">
          <div class="flex items-center gap-3 mb-6">
            <Heart class="w-6 h-6 text-[#ff4757] fill-current" />
            <h3>粉丝留言板</h3>
          </div>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block mb-2 text-sm">昵称</label>
              <input
                type="text"
                v-model="formData.name"
                class="w-full px-4 py-3 bg-secondary border border-border focus:border-[#DF7623] outline-none transition-colors"
                placeholder="你的昵称"
                required
              />
            </div>

            <div>
              <label class="block mb-2 text-sm">留言</label>
              <textarea
                v-model="formData.message"
                class="w-full px-4 py-3 bg-secondary border border-border focus:border-[#DF7623] outline-none transition-colors resize-none"
                rows="5"
                placeholder="想对我说的话..."
                required
              />
            </div>

            <button
              type="submit"
              class="w-full px-6 py-4 bg-[#DF7623] hover:bg-[#DF7623]/90 text-white flex items-center justify-center gap-2 clip-corner transition-all group"
            >
              <span>发送留言</span>
              <Send class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <div class="space-y-6">
          <div class="bg-card border border-border p-8 clip-corner">
            <h3 class="mb-6">官方社交媒体</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                v-for="(link, index) in socialLinks"
                :key="index"
                :href="link.href"
                class="flex items-center gap-3 p-4 border border-border hover:border-[#DF7623]/50 clip-corner-sm transition-all group"
              >
                <div
                  class="w-12 h-12 flex items-center justify-center border-2 clip-corner-xs"
                  :style="{ borderColor: link.color }"
                >
                  <component :is="link.icon" class="w-6 h-6" :style="{ color: link.color }" />
                </div>
                <div class="flex-1">
                  <div class="text-sm group-hover:text-[#DF7623] transition-colors">
                    {{ link.label }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ link.followers }}
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div class="bg-card border border-border p-8 clip-corner">
            <h3 class="mb-6">应援信息</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 mt-2 bg-[#DF7623] clip-corner-xs"></div>
                <div>
                  <div class="text-sm mb-1">官方应援色</div>
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-[#DF7623] clip-corner-xs"></div>
                    <span class="text-xs text-muted-foreground">#DF7623</span>
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 mt-2 bg-[#00f5ff] clip-corner-xs"></div>
                <div class="text-sm">
                  <div class="mb-1">粉丝应援口号</div>
                  <div class="text-[#00f5ff]">"CYBER STAR, 永远闪耀！"</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 mt-2 bg-[#ff4757] clip-corner-xs"></div>
                <div class="text-sm">
                  <div class="mb-1">下次见面会</div>
                  <div class="text-muted-foreground">2026年3月 · 上海</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 粉丝统计 -->
      <div class="bg-card border border-border p-8 clip-corner">
        <h3 class="mb-8 text-center">粉丝力量</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="(stat, index) in fanStats" :key="index" class="text-center">
            <div class="text-2xl sm:text-3xl mb-2" :style="{ color: stat.color }">
              {{ stat.value }}
            </div>
            <div class="text-xs text-muted-foreground">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)

const formData = ref({
  name: '',
  message: '',
})

const handleSubmit = () => {
  // 模拟提交
  console.log('Fan message submitted:', formData.value)
  alert('感谢你的留言！我们会认真阅读每一条粉丝留言 ❤️')
  formData.value = { name: '', message: '' }
}

const socialLinks = [
  { icon: 'Instagram', label: 'Instagram', followers: '800K', href: '#', color: '#DF7623' },
  { icon: 'Twitter', label: 'Twitter', followers: '500K', href: '#', color: '#00f5ff' },
  { icon: 'Youtube', label: 'YouTube', followers: '1.2M', href: '#', color: '#ff4757' },
  { icon: 'MessageCircle', label: 'Weibo', followers: '2M', href: '#', color: '#DF7623' },
]

const fanStats = [
  { label: '总粉丝数', value: '1.2M', color: '#DF7623' },
  { label: '月活跃粉丝', value: '850K', color: '#00f5ff' },
  { label: '演唱会观众', value: '100K+', color: '#ff4757' },
  { label: '留言互动', value: '500K+', color: '#DF7623' },
]
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

.grid-background {
  background-image:
    linear-gradient(rgba(223, 118, 35, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(223, 118, 35, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black, transparent 80%);
}
</style>
