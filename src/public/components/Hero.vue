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
      <ThreeScrollingText :isLive="liveStatus === 'LIVING'" />
    </div>

    <div class="max-w-5xl mx-auto text-center relative z-10">
      <AvatarSection />
      <TitleSection />
      <LiveStatusSection @liveStatusChange="handleLiveStatusChange" />
      <StatsSection />
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
import { ref } from 'vue'
import { ArrowDown } from 'lucide-vue-next'
import ThreeScrollingText from './ThreeScrollingText.vue'
import AvatarSection from './AvatarSection.vue'
import TitleSection from './TitleSection.vue'
import LiveStatusSection from './LiveStatusSection.vue'
import StatsSection from './StatsSection.vue'

const liveStatus = ref<string>('UNKNOWN')

const handleLiveStatusChange = (status: string) => {
  liveStatus.value = status
}
</script>

<style scoped>
.animate-fade-in-delay-1000 {
  animation: fadeIn 1s ease-out 1s forwards;
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
</style>
