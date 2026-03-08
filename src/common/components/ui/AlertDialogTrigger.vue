<template>
  <button
    class="alert-dialog-trigger"
    data-slot="alert-dialog-trigger"
    :class="className"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.alert-dialog-trigger {
  cursor: pointer;
}
</style>
