<template>
  <button
    class="metal-button"
    :class="{
      'metal-button--primary': type === 'primary',
      'metal-button--secondary': type === 'secondary',
    }"
    :style="buttonStyle"
    @click="$emit('click')"
  >
    <span class="metal-button__content">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary'].includes(value),
  },
  color: {
    type: String,
    default: '#DF7623',
  },
})

defineEmits(['click'])

const buttonStyle = {
  '--button-color': props.color,
  '--button-color-rgb':
    props.color === '#DF7623'
      ? '223, 118, 35'
      : props.color === '#00f5ff'
        ? '0, 245, 255'
        : props.color === '#ff4757'
          ? '255, 71, 87'
          : '223, 118, 35',
}
</script>

<style scoped>
.metal-button {
  position: relative;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #2a2a4a, #1a1a2e);
  color: white;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.metal-button::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: var(--button-color, #df7623);
  border-radius: 9999px;
  z-index: -1;
  opacity: 0.5;
  filter: blur(10px);
  transition: all 0.3s ease;
}

.metal-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, #2a2a4a, #1a1a2e);
  border-radius: 9999px;
  z-index: -1;
}

.metal-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(var(--button-color-rgb, 223, 118, 35), 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.metal-button:hover::before {
  opacity: 0.8;
  filter: blur(15px);
  animation: pulse 2s infinite;
}

.metal-button__content {
  position: relative;
  z-index: 1;
}

.metal-button--primary {
  color: white;
}

.metal-button--secondary {
  color: #0a0a0f;
  background: linear-gradient(145deg, #f0f0f0, #d0d0d0);
}

.metal-button--secondary::after {
  background: linear-gradient(145deg, #f0f0f0, #d0d0d0);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .metal-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
