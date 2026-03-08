<template>
  <li
    data-slot="breadcrumb-separator"
    role="presentation"
    aria-hidden="true"
    class="breadcrumb-separator [&>svg]:size-3.5"
    :class="className"
  >
    <slot>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </slot>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<style scoped>
.breadcrumb-separator {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-separator svg {
  width: 0.875rem;
  height: 0.875rem;
  color: inherit;
}
</style>
