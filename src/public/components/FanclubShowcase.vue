<template>
  <div class="min-h-screen flex flex-col bg-[#0a0a0f] text-white p-4 sm:p-6 md:p-8">
    <FlickeringGrid
      class="relative inset-0 z-0 mask-[radial-gradient(450px_circle_at_center,white,transparent)]"
      :square-size="4"
      :grid-gap="6"
      color="#60A5FA"
      :max-opacity="0.5"
      :flicker-chance="0.1"
    >
      <nav class="w-full mb-8">
        <div class="flex justify-end items-center space-x-4 text-sm text-gray-400">
          <router-link to="/" class="hover:text-[#DF7623] transition-colors">首页</router-link>
          <router-link to="/admin" class="hover:text-[#DF7623] transition-colors">后台</router-link>
        </div>
      </nav>
      <div class="flex flex-col flex-grow items-center justify-center">
        <header class="mb-12 flex flex-col items-center">
          <div class="relative w-36 h-36 mb-4">
            <div
              class="absolute inset-0 rounded-full bg-gradient-to-r from-[#DF7623] via-amber-400 to-[#DF7623] animate-spin-slow opacity-70"
            ></div>
            <div
              class="absolute inset-1 rounded-full bg-[#1a1a2e] overflow-hidden border border-gray-700"
            >
              <img :src="randomAvatar" alt="Avatar" class="w-full h-full object-cover" />
            </div>
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold text-[#DF7623] text-center">
            {{ config.anchorName }}
          </h1>
        </header>

        <main class="w-full max-w-3xl flex flex-col gap-12">
          <div class="bg-[#1a1a2e] rounded-2xl p-6 sm:p-8 shadow-md border border-gray-700">
            <h2 class="text-xl sm:text-2xl font-semibold text-white mb-6 text-center">
              纪念日倒计时
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                class="flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div class="text-sm text-gray-400 mb-2">已出道</div>
                <div class="text-3xl sm:text-4xl font-bold text-[#DF7623] mb-1">
                  {{ daysSinceDebut }}
                </div>
                <div class="text-sm text-gray-400">天</div>
              </div>
              <div
                class="flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div class="text-sm text-gray-400 mb-2">距离生日</div>
                <div class="text-3xl sm:text-4xl font-bold text-[#00f5ff] mb-1">
                  {{ daysUntilBirthday }}
                </div>
                <div class="text-sm text-gray-400">天</div>
              </div>
              <div
                class="flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div class="text-sm text-gray-400 mb-2">距离出道纪念日</div>
                <div class="text-3xl sm:text-4xl font-bold text-[#ff4757] mb-1">
                  {{ daysUntilDebutAnniversary }}
                </div>
                <div class="text-sm text-gray-400">天</div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-4 sm:gap-6">
            <div
              class="px-6 py-3 bg-[#DF7623] text-white rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-[#DF7623]/90 hover:-translate-y-1 shadow-md"
            >
              歌单
            </div>
            <div
              class="px-6 py-3 bg-[#00f5ff] text-[#0a0a0f] rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-[#00f5ff]/90 hover:-translate-y-1 shadow-md"
            >
              提问箱
            </div>
            <div
              class="px-6 py-3 bg-[#ff4757] text-white rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-[#ff4757]/90 hover:-translate-y-1 shadow-md"
            >
              豆力榜
            </div>
            <div
              class="px-6 py-3 bg-[#DF7623] text-white rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-[#DF7623]/90 hover:-translate-y-1 shadow-md"
            >
              两个大凶
            </div>
          </div>

          <!-- 人设信息展示 -->
          <div class="bg-[#1a1a2e] rounded-2xl p-6 sm:p-8 shadow-md border border-gray-700">
            <h2 class="text-xl sm:text-2xl font-semibold text-white mb-6 text-center">人设信息</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center gap-3">
                <span class="w-24 text-gray-400">姓名</span>
                <span class="text-white">{{ config.anchorName }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-gray-400">生日</span>
                <span class="text-[#00f5ff]"
                  >{{ config.birthday.getMonth() + 1 }}月{{ config.birthday.getDate() }}日</span
                >
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-gray-400">年龄</span>
                <span class="text-white">16岁</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-gray-400">种族</span>
                <span class="text-[#DF7623]">侏儒兔</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-gray-400">身高</span>
                <span class="text-white">165cm（加上耳朵180cm）</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-gray-400">职业</span>
                <span class="text-[#ff4757]">见习杀手（转正中）</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-gray-400">粉丝牌</span>
                <span class="text-white">蔻萝特（胡萝卜）</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-gray-400">应援色</span>
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-[#DF7623]"></div>
                  <span class="text-[#DF7623]">#DF7623</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer class="mt-8 text-gray-500 text-sm text-center">
        <p>备案号占位</p>
      </footer>
    </FlickeringGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import type { FanclubConfig } from "@/types/fanclub";
import avatarA from "@/assets/avatar/avatar_a.webp";
import avatarKu from "@/assets/avatar/avatar_ku.webp";
import avatarXiao from "@/assets/avatar/avatar_xiao.webp";

const config = ref<FanclubConfig>({
  anchorName: "莉蔻Liko",
  debutDate: new Date("2026-01-14"),
  birthday: new Date("2025-08-03"),
});
const daysSinceDebut = ref(0);
const daysUntilBirthday = ref(0);
const daysUntilDebutAnniversary = ref(0);
const randomAvatar = ref<string>(avatarA as string);

// 更新倒计时
const updateCountdowns = () => {
  const today = dayjs();
  const debutDate = dayjs(config.value.debutDate);

  // 计算下一个生日
  const birthday = dayjs(config.value.birthday);
  const birthdayThisYear = dayjs().year(today.year()).month(birthday.month()).date(birthday.date());
  let birthdayDate = birthdayThisYear;
  if (today.isAfter(birthdayThisYear)) {
    birthdayDate = birthdayThisYear.add(1, "year");
  }

  // 计算下一个出道纪念日
  const debut = dayjs(config.value.debutDate);
  const debutAnniversaryThisYear = dayjs()
    .year(today.year())
    .month(debut.month())
    .date(debut.date());
  let debutAnniversaryDate = debutAnniversaryThisYear;
  if (today.isAfter(debutAnniversaryThisYear)) {
    debutAnniversaryDate = debutAnniversaryThisYear.add(1, "year");
  }

  daysSinceDebut.value = today.diff(debutDate, "day");
  daysUntilBirthday.value = birthdayDate.diff(today, "day");
  daysUntilDebutAnniversary.value = debutAnniversaryDate.diff(today, "day");
};

// 初始化
onMounted(() => {
  // 随机选择头像
  const avatars = [avatarA, avatarKu, avatarXiao];
  randomAvatar.value = avatars[Math.floor(Math.random() * avatars.length)] as string;

  // 初始计算倒计时
  updateCountdowns();

  console.log(`${config.value.anchorName} showcase page loaded`);
});
</script>

<style scoped>
button {
  background: transparent !important;
  border: none !important;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>

<style></style>
