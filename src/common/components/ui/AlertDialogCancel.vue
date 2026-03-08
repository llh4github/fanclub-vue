<template>
  <button
    class="alert-dialog-cancel"
    data-slot="alert-dialog-cancel"
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
.alert-dialog-cancel {
  cursor: pointer;
}
</style>
