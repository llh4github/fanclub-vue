<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <header class="bg-primary text-white py-4 px-6 sm:px-8 shadow-md">
      <h1 class="text-xl sm:text-2xl font-bold">后台管理页面</h1>
    </header>
    
    <main class="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div class="bg-white p-8 sm:p-10 rounded-xl shadow-md text-center">
        <p class="text-lg sm:text-xl text-gray-600 mb-2">后台管理功能正在开发中...</p>
        <p class="text-lg sm:text-xl text-gray-600">敬请期待！</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts" name="AdminIndex">
import { onMounted } from "vue";

onMounted(() => {
  console.log("后台管理页面已加载");
});
</script>

<style scoped>
/* 自定义样式已通过Tailwind CSS实现 */
</style>