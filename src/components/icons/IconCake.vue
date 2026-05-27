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
      d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21M23 21V19C22.9993 17.017 21.5801 15.2044 19.6743 14.4379C17.7685 13.6714 15.5493 13.9551 13.9305 15.1806L12 16.5L10.0695 15.1806C8.45071 13.9551 6.23154 13.6714 4.32573 14.4379C2.41991 15.2044 1.00068 17.017 1 19V21H23ZM12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>