<template>
  <div class="carousel-content overflow-hidden" data-slot="carousel-content" ref="containerRef">
    <div
      class="carousel-track flex"
      :class="[{ 'flex-col': orientation === 'vertical' }, className]"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue'

const props = defineProps<{
  className?: string
}>()

const containerRef = ref<HTMLElement | null>(null)
const carouselContext = inject('carouselContext') as any

if (!carouselContext) {
  throw new Error('CarouselContent must be used within a Carousel')
}

const { orientation } = carouselContext

// 将容器引用传递给父组件
watch(
  containerRef,
  (newRef) => {
    if (newRef && carouselContext.containerRef) {
      carouselContext.containerRef.value = newRef.querySelector('.carousel-track')
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.carousel-content {
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform 0.3s ease;
}

.carousel-track.flex-col {
  flex-direction: column;
}
</style>
