<template>
  <div
    class="carousel-item min-w-0 shrink-0 grow-0 basis-full"
    data-slot="carousel-item"
    :class="[orientation === 'horizontal' ? 'pl-4' : 'pt-4', className]"
    role="group"
    aria-roledescription="slide"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps<{
  className?: string
}>()

const carouselContext = inject('carouselContext') as any

if (!carouselContext) {
  throw new Error('CarouselItem must be used within a Carousel')
}

const { orientation } = carouselContext
</script>

<style scoped>
.carousel-item {
  flex: 0 0 100%;
  min-width: 0;
}

.carousel-item.pl-4 {
  padding-left: 1rem;
}

.carousel-item.pt-4 {
  padding-top: 1rem;
}
</style>
