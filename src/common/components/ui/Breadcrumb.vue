<template>
  <nav aria-label="breadcrumb" data-slot="breadcrumb">
    <slot></slot>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
nav {
  display: block;
}
</style>
