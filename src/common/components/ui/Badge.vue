<template>
  <component
    :is="asChild ? 'span' : 'span'"
    class="badge inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden"
    data-slot="badge"
    :class="[variantClasses[variant || 'default'], className]"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'default' | 'secondary' | 'destructive' | 'outline'

defineProps<{
  variant?: Variant
  asChild?: boolean
  className?: string
}>()

const variantClasses = computed(() => ({
  default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
  secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
  destructive:
    'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
  outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
}))
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  width: fit-content;
  flex-shrink: 0;
  gap: 0.25rem;
  transition:
    color 0.2s ease,
    box-shadow 0.2s ease;
  overflow: hidden;
}

.badge > svg {
  width: 0.75rem;
  height: 0.75rem;
  pointer-events: none;
}

.badge:focus-visible {
  border-color: var(--ring);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.badge[aria-invalid] {
  border-color: var(--destructive);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

@media (prefers-color-scheme: dark) {
  .badge[aria-invalid] {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4);
  }
}
</style>
