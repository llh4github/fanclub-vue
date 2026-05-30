<script setup lang="ts">
defineProps<{
  size?: number
  color?: string
}>()
</script>

<template>
  <svg
    :width="size || 20"
    :height="size || 20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23 7L16 12L23 17V7Z"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <rect
      x="1"
      y="5"
      width="15"
      height="14"
      rx="2"
      ry="2"
      :stroke="color || 'currentColor'"
      stroke-width="2"
    />
  </svg>
</template>