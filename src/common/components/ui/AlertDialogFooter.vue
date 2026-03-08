<template>
  <div
    class="alert-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
    data-slot="alert-dialog-footer"
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
.alert-dialog-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .alert-dialog-footer {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
