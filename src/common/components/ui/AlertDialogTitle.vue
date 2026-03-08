<template>
  <h2
    class="alert-dialog-title text-lg font-semibold"
    data-slot="alert-dialog-title"
    :class="className"
  >
    <slot></slot>
  </h2>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
.alert-dialog-title {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.5;
}
</style>
