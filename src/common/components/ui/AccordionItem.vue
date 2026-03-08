<template>
  <div
    class="accordion-item border-b last:border-b-0"
    data-slot="accordion-item"
    :class="className"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string
  className?: string
}>()
</script>

<style scoped>
.accordion-item {
  border-bottom: 1px solid var(--border);
}

.accordion-item:last-child {
  border-bottom: none;
}
</style>
