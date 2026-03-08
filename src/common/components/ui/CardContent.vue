<template>
  <div class="card-content" :class="className">
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
.card-content {
  padding-left: 1.5rem;
}

.card-content:last-child {
  padding-bottom: 1.5rem;
}
</style>
