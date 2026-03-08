<template>
  <p class="card-description" :class="className">
    <slot></slot>
  </p>
</template>

<script setup lang="ts">
defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.card-description {
  color: var(--muted-foreground);
}
</style>
