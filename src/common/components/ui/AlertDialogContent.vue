<template>
  <div v-if="open" class="alert-dialog-content-wrapper">
    <AlertDialogOverlay :open="open" @click="$emit('close')" />
    <div
      class="alert-dialog-content bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg"
      data-slot="alert-dialog-content"
      :class="className"
      :data-state="open ? 'open' : 'closed'"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import AlertDialogOverlay from './AlertDialogOverlay.vue'

defineProps<{
  open?: boolean
  className?: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.alert-dialog-content-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-dialog-content {
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  width: 100%;
  max-width: 32rem;
  transition: all 0.2s ease;
}

.alert-dialog-content[data-state='closed'] {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
  pointer-events: none;
}

.alert-dialog-content[data-state='open'] {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  pointer-events: auto;
}
</style>
