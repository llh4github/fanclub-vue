<template>
  <button
    class="accordion-trigger focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
    data-slot="accordion-trigger"
    :class="className"
    @click="$emit('click')"
  >
    <slot></slot>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
      :class="{ 'rotate-180': open }"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  open?: boolean
  className?: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.accordion-trigger {
  width: 100%;
}
</style>
