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
      d="M4 15H20M4 15C3 17 4 19 6 20H18C20 19 21 17 20 15M4 15V9C4 7.89543 4.89543 7 6 7H18C19.1046 7 20 7.89543 20 9V15M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7M12 12V16M12 12L9 15M12 12L15 15"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>