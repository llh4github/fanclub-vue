<template>
  <img
    class="avatar-image aspect-square size-full"
    data-slot="avatar-image"
    :class="className"
    :src="src"
    :alt="alt"
  />
</template>

<script setup lang="ts">
defineProps<{
  src: string
  alt: string
  className?: string
}>()
</script>

<style scoped>
.avatar-image {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
</style>
