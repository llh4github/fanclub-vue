<template>
  <div
    class="alert relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current"
    data-slot="alert"
    role="alert"
    :class="[variantClasses[variant || 'default'], className]"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'default' | 'destructive'

defineProps<{
  variant?: Variant
  className?: string
}>()

const variantClasses = computed(() => ({
  default: 'bg-card text-card-foreground',
  destructive:
    'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
}))
</script>

<style scoped>
.alert {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
}
</style>
