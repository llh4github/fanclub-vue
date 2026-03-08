<template>
  <div
    class="avatar-fallback bg-muted flex size-full items-center justify-center rounded-full"
    data-slot="avatar-fallback"
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
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--muted);
  border-radius: 9999px;
}
</style>
