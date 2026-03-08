<template>
  <p
    class="alert-dialog-description text-muted-foreground text-sm"
    data-slot="alert-dialog-description"
    :class="className"
  >
    <slot></slot>
  </p>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
.alert-dialog-description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--muted-foreground);
}
</style>
