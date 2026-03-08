<template>
  <div class="card-action" :class="className">
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
.card-action {
  grid-column-start: 2;
  grid-row: span 2;
  grid-row-start: 1;
  align-self: start;
  justify-self: end;
}
</style>
