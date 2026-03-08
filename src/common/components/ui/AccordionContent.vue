<template>
  <div
    class="accordion-content data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
    data-slot="accordion-content"
    :class="className"
    :data-state="open ? 'open' : 'closed'"
  >
    <div class="pt-0 pb-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open?: boolean
  className?: string
}>()
</script>

<style scoped>
.accordion-content {
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

.accordion-content[data-state='closed'] {
  max-height: 0;
}

.accordion-content[data-state='open'] {
  max-height: 1000px;
}
</style>
