<template>
  <a
    data-slot="breadcrumb-link"
    class="breadcrumb-link hover:text-foreground transition-colors"
    :class="className"
    :href="href"
  >
    <slot></slot>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  href: string
  className?: string
}>()
</script>

<style scoped>
.breadcrumb-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--foreground);
}
</style>
