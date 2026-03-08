<template>
  <div
    class="aspect-ratio"
    data-slot="aspect-ratio"
    :style="{ aspectRatio: ratio }"
    :class="className"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ratio: string | number
  className?: string
}>()
</script>

<style scoped>
.aspect-ratio {
  width: 100%;
  position: relative;
}
</style>
