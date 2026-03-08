<template>
  <div class="glass-card" :class="{ dark: isDarkMode }">
    <div class="glass-card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const isDarkMode = ref(false)

// 初始化夜间模式状态
onMounted(() => {
  // 从localStorage读取状态
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode) {
    isDarkMode.value = JSON.parse(savedDarkMode)
  } else {
    // 检查系统偏好
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
})

// 监听暗色模式变化
watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', JSON.stringify(newValue))
})
</script>

<style scoped>
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.glass-card.dark {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(223, 118, 35, 0.3);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
}

.glass-card.dark:hover {
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
}

.glass-card-content {
  padding: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .glass-card-content {
    padding: 1rem;
  }
}
</style>
