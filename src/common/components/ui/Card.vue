<template>
  <div class="card" :class="className">
    <slot></slot>
  </div>
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
.card {
  background-color: var(--card);
  color: var(--card-foreground);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
}
</style>
