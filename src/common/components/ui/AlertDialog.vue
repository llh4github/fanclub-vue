<template>
  <div class="alert-dialog" data-slot="alert-dialog">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open?: boolean
}>()

defineEmits<{
  (e: 'update:open', value: boolean): void
}>()
</script>

<style scoped>
.alert-dialog {
  display: contents;
}
</style>
