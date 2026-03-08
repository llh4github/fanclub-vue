<template>
  <footer class="border-t border-border bg-card/50 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div
        class="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground"
      >
        <p>© {{ currentYear }} LLH. All rights reserved. 网站为粉丝自建。</p>
        <p class="flex items-center gap-2">
          Made with <Heart class="w-4 h-4 text-[#DF7623] fill-current" /> for all fans
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.clip-corner {
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}
</style>
