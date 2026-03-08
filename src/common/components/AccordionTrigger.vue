<template>
  <button
    class="accordion-trigger flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-[#DF7623]/50 disabled:pointer-events-none disabled:opacity-50"
    :class="className"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
    <div
      class="text-gray-400 pointer-events-none size-4 shrink-0 transition-transform duration-200"
      :class="{ 'rotate-180': isOpen }"
    >
      ▼
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps({
  className: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>

<style scoped>
.accordion-trigger {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}

.accordion-trigger:hover {
  text-decoration: underline;
}

.accordion-trigger:focus-visible {
  ring: 3px solid rgba(223, 118, 35, 0.5);
}

.accordion-trigger:disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
