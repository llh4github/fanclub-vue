<template>
  <div class="card-footer" :class="className">
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
.card-footer {
  display: flex;
  align-items: center;
  padding-left: 1.5rem;
  padding-bottom: 1.5rem;
}

.card-footer.border-t {
  padding-top: 1.5rem;
}
</style>
