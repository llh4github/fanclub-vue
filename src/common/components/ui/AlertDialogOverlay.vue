<template>
  <div
    class="alert-dialog-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
    data-slot="alert-dialog-overlay"
    :class="className"
    :data-state="open ? 'open' : 'closed'"
    @click="$emit('click')"
  ></div>
</template>

<script setup lang="ts">
defineProps<{
  open?: boolean
  className?: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.alert-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  transition: opacity 0.2s ease;
}

.alert-dialog-overlay[data-state='closed'] {
  opacity: 0;
  pointer-events: none;
}

.alert-dialog-overlay[data-state='open'] {
  opacity: 1;
  pointer-events: auto;
}
</style>
