<template>
  <div
    class="alert-description text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed"
    data-slot="alert-description"
    :class="className"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
.alert-description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--muted-foreground);
}

.alert-description p {
  line-height: 1.625;
}
</style>
