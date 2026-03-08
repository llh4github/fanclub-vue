<template>
  <span
    data-slot="breadcrumb-page"
    role="link"
    aria-disabled="true"
    aria-current="page"
    class="breadcrumb-page text-foreground font-normal"
    :class="className"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
.breadcrumb-page {
  color: var(--foreground);
  font-weight: 400;
  cursor: default;
}
</style>
