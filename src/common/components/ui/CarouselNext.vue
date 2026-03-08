<template>
  <button
    class="carousel-next absolute size-8 rounded-full"
    data-slot="carousel-next"
    :class="[
      orientation === 'horizontal'
        ? 'top-1/2 -right-12 -translate-y-1/2'
        : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
      className,
    ]"
    :disabled="!canScrollNext"
    @click="scrollNext"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
    <span class="sr-only">Next slide</span>
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps<{
  className?: string
}>()

const carouselContext = inject('carouselContext') as any

if (!carouselContext) {
  throw new Error('CarouselNext must be used within a Carousel')
}

const { orientation, scrollNext, canScrollNext } = carouselContext
</script>

<style scoped>
.carousel-next {
  position: absolute;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background-color: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-next:hover:not(:disabled) {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

.carousel-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
