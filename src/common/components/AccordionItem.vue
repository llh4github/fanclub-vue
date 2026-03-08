<template>
  <div class="accordion-item border-b last:border-b-0" :class="className">
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
.accordion-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.accordion-item:last-child {
  border-bottom: none;
}
</style>
