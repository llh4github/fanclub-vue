<template>
  <!-- 样式将通过脚本动态添加 -->
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  id: string
  config: Record<string, { theme?: Record<string, string>; color?: string }>
}>()

const THEMES = { light: '', dark: '.dark' } as const

const styles = computed(() => {
  const colorConfig = Object.entries(props.config).filter(
    ([, config]) => config.theme || config.color,
  )

  if (!colorConfig.length) {
    return null
  }

  return Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const themeStyles = colorConfig
        .map(([key, itemConfig]) => {
          const color =
            itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
          return color ? `  --color-${key}: ${color};` : null
        })
        .filter(Boolean)
        .join('\n')

      return `${prefix} [data-chart=${props.id}] {\n${themeStyles}\n}`
    })
    .join('\n')
})

let styleElement: HTMLStyleElement | null = null

const updateStyle = () => {
  if (!styles.value) {
    if (styleElement) {
      styleElement.remove()
      styleElement = null
    }
    return
  }

  if (!styleElement) {
    styleElement = document.createElement('style')
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = styles.value
}

onMounted(() => {
  updateStyle()
})

onUnmounted(() => {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
})

watch(styles, () => {
  updateStyle()
})
</script>
