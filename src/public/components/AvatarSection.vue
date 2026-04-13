<template>
  <!-- 圆形头像框 -->
  <div class="relative w-36 h-36 mx-auto mb-6 z-10" :class="{ 'animate-fade-in-delay-100': true }">
    <div
      class="absolute inset-0 rounded-full bg-gradient-to-r from-[#DF7623] via-amber-400 to-[#DF7623] animate-spin-slow opacity-70"
    ></div>
    <div class="absolute inset-1 rounded-full bg-[#1a1a2e] overflow-hidden border border-gray-700">
      <img :src="randomAvatar" alt="莉蔻" class="w-full h-full object-cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import avatarA from '@/assets/avatar/avatar_a.webp'
import avatarKu from '@/assets/avatar/avatar_ku.webp'
import avatarXiao from '@/assets/avatar/avatar_xiao.webp'
import avatar04 from '@/assets/avatar/avatar_04.jpg'

const randomAvatar = ref<string>(avatarA as string)

onMounted(() => {
  // 随机选择头像
  const avatars = [avatarA, avatarKu, avatarXiao, avatar04]
  randomAvatar.value = avatars[Math.floor(Math.random() * avatars.length)] as string
})
</script>

<style scoped>
.animate-fade-in-delay-100 {
  animation: fadeIn 0.8s ease-out 0.1s forwards;
  opacity: 0;
  transform: translateY(20px);
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
