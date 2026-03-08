<template>
  <div
    class="avatar relative flex size-10 shrink-0 overflow-hidden rounded-full"
    data-slot="avatar"
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
.avatar {
  position: relative;
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 9999px;
}
</style>
