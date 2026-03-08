<template>
  <div
    class="accordion-content overflow-hidden text-sm transition-all duration-300 ease-in-out"
    :class="[className, { 'max-h-0 opacity-0': !isOpen, 'max-h-96 opacity-100': isOpen }]"
  >
    <div class="pt-0 pb-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  className: {
    type: String,
    default: '',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.accordion-content {
  max-height: 0;
  opacity: 0;
  transition:
    max-height 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
}

.accordion-content.max-h-96 {
  max-height: 24rem;
}

.accordion-content.opacity-100 {
  opacity: 1;
}
</style>
