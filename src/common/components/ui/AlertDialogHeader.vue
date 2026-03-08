<template>
  <div
    class="alert-dialog-header flex flex-col gap-2 text-center sm:text-left"
    data-slot="alert-dialog-header"
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
.alert-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

@media (min-width: 640px) {
  .alert-dialog-header {
    text-align: left;
  }
}
</style>
