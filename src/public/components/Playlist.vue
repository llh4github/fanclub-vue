<template>
  <section id="playlist" class="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
    <div class="absolute inset-0 grid-background"></div>

    <div class="max-w-7xl mx-auto relative z-10">
      <div class="text-center mb-16">
        <div class="inline-block mb-4">
          <span
            class="text-sm tracking-[0.3em] text-[#DF7623] border border-[#DF7623]/30 px-4 py-1 clip-corner"
          >
            PLAYLIST
          </span>
        </div>
        <h2 class="text-3xl sm:text-5xl mb-6">歌单</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          莉蔻的精选歌单，记录每一个精彩瞬间
        </p>
        <n-text type="warning"> 我真的要做这个功能么？🤣 </n-text>
      </div>

      <div class="space-y-6">
        <!-- 歌曲表单 -->
        <div
          v-for="(song, index) in songs"
          :key="index"
          class="bg-card border border-border p-6 clip-corner hover:border-[#DF7623]/50 transition-all duration-300"
        >
          <div class="flex items-center gap-6">
            <!-- 歌曲序号 -->
            <div
              class="w-10 h-10 flex items-center justify-center border border-[#DF7623] clip-corner text-[#DF7623] font-bold"
            >
              {{ index + 1 }}
            </div>

            <!-- 歌曲信息 -->
            <div class="flex-1">
              <h3 class="text-lg font-bold mb-2">{{ song.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ song.artist }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-4">
              <button
                class="w-10 h-10 flex items-center justify-center border border-[#DF7623] clip-corner hover:bg-[#DF7623]/10 transition-colors"
              >
                <Play class="w-5 h-5 text-[#DF7623]" />
              </button>
              <button
                class="w-10 h-10 flex items-center justify-center border border-[#DF7623] clip-corner hover:bg-[#DF7623]/10 transition-colors"
              >
                <Heart class="w-5 h-5 text-[#DF7623]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Play, Heart } from 'lucide-vue-next'

// 歌曲数据
const songs = [
  {
    title: '彩虹糖的梦',
    artist: '莉蔻',
  },
  {
    title: '要抱抱',
    artist: '莉蔻',
  },
  {
    title: '老公天下第一',
    artist: '莉蔻',
  },
  {
    title: '素颜',
    artist: '莉蔻',
  },
  {
    title: 'VTL',
    artist: '莉蔻',
  },
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

.grid-background {
  background-image:
    linear-gradient(rgba(223, 118, 35, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(223, 118, 35, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black, transparent 80%);
}
</style>
