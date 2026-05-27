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
      d="M9 18V5L12 2L15 5V18"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M20 18V12C20 10.8954 19.1046 10 18 10C16.8954 10 16 10.8954 16 12V18"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M4 18V9C4 7.89543 4.89543 7 6 7C7.10457 7 8 7.89543 8 9V18"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>