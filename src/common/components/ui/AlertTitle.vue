<template>
  <div
    class="alert-title col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight"
    data-slot="alert-title"
    :class="className"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
.alert-title {
  font-weight: 500;
  line-height: 1;
  min-height: 1rem;
}
</style>
