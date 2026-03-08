<template>
  <h4 class="card-title" :class="className">
    <slot></slot>
  </h4>
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
.card-title {
  line-height: 1;
}
</style>
