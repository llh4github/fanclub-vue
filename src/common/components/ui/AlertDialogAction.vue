<template>
  <button
    class="alert-dialog-action"
    data-slot="alert-dialog-action"
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
.alert-dialog-action {
  cursor: pointer;
}
</style>
