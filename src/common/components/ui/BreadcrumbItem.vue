<template>
  <li
    data-slot="breadcrumb-item"
    class="breadcrumb-item inline-flex items-center gap-1.5"
    :class="className"
  >
    <slot></slot>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}
</style>
