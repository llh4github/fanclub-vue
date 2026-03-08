<template>
  <div
    class="carousel relative"
    data-slot="carousel"
    :class="className"
    @keydown.capture="handleKeyDown"
    role="region"
    aria-roledescription="carousel"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  className?: string
  orientation?: 'horizontal' | 'vertical'
  opts?: any
  setApi?: (api: any) => void
  plugins?: any
}>()

const currentIndex = ref(0)
const canScrollPrev = ref(false)
const canScrollNext = ref(true)
const items = ref<HTMLElement[]>([])
const containerRef = ref<HTMLElement | null>(null)

const scrollPrev = () => {
  if (canScrollPrev.value) {
    currentIndex.value--
    updateScroll()
  }
}

const scrollNext = () => {
  if (canScrollNext.value) {
    currentIndex.value++
    updateScroll()
  }
}

const updateScroll = () => {
  if (!containerRef.value) return

  const container = containerRef.value
  const itemWidth = container.offsetWidth
  const itemHeight = container.offsetHeight

  if (props.orientation === 'horizontal') {
    container.scrollLeft = currentIndex.value * itemWidth
  } else {
    container.scrollTop = currentIndex.value * itemHeight
  }

  updateCanScroll()
}

const updateCanScroll = () => {
  canScrollPrev.value = currentIndex.value > 0
  canScrollNext.value = currentIndex.value < items.value.length - 1
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    scrollPrev()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    scrollNext()
  }
}

const updateItems = () => {
  if (!containerRef.value) return

  const children = containerRef.value.children
  items.value = Array.from(children) as HTMLElement[]
  updateCanScroll()
}

provide('carouselContext', {
  currentIndex,
  canScrollPrev,
  canScrollNext,
  scrollPrev,
  scrollNext,
  orientation: props.orientation || 'horizontal',
  containerRef,
})

onMounted(() => {
  setTimeout(updateItems, 100) // 等待子组件挂载
  window.addEventListener('resize', updateItems)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateItems)
})
</script>

<style scoped>
.carousel {
  position: relative;
}
</style>
