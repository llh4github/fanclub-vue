<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <header class="bg-primary text-white py-4 px-6 sm:px-8 shadow-md">
      <h1 class="text-xl sm:text-2xl font-bold">后台管理页面</h1>
    </header>

    <main class="flex-1 p-4 sm:p-6 md:p-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts" name="AdminIndex">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('后台管理页面已加载')
})
</script>

<style scoped>
/* 自定义样式已通过Tailwind CSS实现 */
</style>
