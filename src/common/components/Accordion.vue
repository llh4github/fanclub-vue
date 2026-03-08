<template>
  <div class="accordion" :class="className">
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
.accordion {
  width: 100%;
}
</style>
