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
      d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.6415 19.6871 1.81447 19.9905C1.98744 20.2939 2.23673 20.5468 2.53371 20.7239C2.8307 20.901 3.16482 20.9962 3.5 21H20.5C20.8352 21 21.1693 20.901 21.4663 20.7239C21.7633 20.5468 22.0126 20.2939 22.1855 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6818 2.98585 12.3434 2.89725 12 2.89725C11.6566 2.89725 11.3182 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 9V13"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 17H12.01"
      :stroke="color || 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>