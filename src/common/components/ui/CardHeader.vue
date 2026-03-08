<template>
  <div class="card-header" :class="className">
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
.card-header {
  display: grid;
  grid-template-rows: auto auto;
  grid-auto-rows: min-content;
  align-items: start;
  gap: 0.375rem;
  padding-left: 1.5rem;
  padding-top: 1.5rem;
  container-type: inline-size;
  container-name: card-header;
}

.card-header:has([data-slot='card-action']) {
  grid-template-columns: 1fr auto;
}

.card-header.border-b {
  padding-bottom: 1.5rem;
}
</style>
