<template>
  <input
    :type="type"
    class="input"
    :class="className"
    :disabled="disabled"
    :placeholder="placeholder"
    v-model="inputValue"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'text',
  },
  className: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['input', 'change', 'focus', 'blur', 'update:modelValue'])

const inputValue = ref(props.modelValue)

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  },
)
</script>

<style scoped>
.input {
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--foreground);
  background-color: var(--input-background);
  border: 1px solid var(--input);
  border-radius: 0.375rem;
  padding: 0.25rem 0.75rem;
  height: 2.25rem;
  width: 100%;
  min-width: 0;
  transition:
    color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

.input::placeholder {
  color: var(--muted-foreground);
}

.input:focus-visible {
  border-color: var(--ring);
  box-shadow: 0 0 0 3px rgba(var(--ring-rgb), 0.5);
}

.input:disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
}

.input[type='file'] {
  display: inline-flex;
  height: 1.75rem;
  border: 0;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
}

.input[aria-invalid] {
  border-color: var(--destructive);
  box-shadow: 0 0 0 3px rgba(var(--destructive-rgb), 0.2);
}

@media (min-width: 768px) {
  .input {
    font-size: 0.875rem;
  }
}
</style>
