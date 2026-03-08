<template>
  <div
    class="accordion"
    data-slot="accordion"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string | null
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()
</script>

<style scoped>
.accordion {
  width: 100%;
}
</style>
