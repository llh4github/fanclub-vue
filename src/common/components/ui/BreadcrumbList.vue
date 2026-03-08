<template>
  <ol
    data-slot="breadcrumb-list"
    class="breadcrumb-list text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5"
    :class="className"
  >
    <slot></slot>
  </ol>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  word-break: break-word;
}

@media (min-width: 640px) {
  .breadcrumb-list {
    gap: 0.625rem;
  }
}
</style>
