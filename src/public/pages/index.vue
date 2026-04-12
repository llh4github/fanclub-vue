<template>
  <div class="min-h-screen bg-background text-foreground relative overflow-hidden">
    <Navigation />
    <main class="relative z-10">
      <Hero />
      <!-- <About /> -->
      <WeekCalendar />
      <Timeline />
      <!-- <Playlist /> -->
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navigation from '../components/Navigation.vue'
import Hero from '../components/Hero.vue'
// import About from '../components/About.vue'
import WeekCalendar from '../components/WeekCalendar.vue'
import Timeline from '../components/Timeline.vue'
// import Playlist from '../components/Playlist.vue'
import Footer from '../components/Footer.vue'
</script>

<style>
/* 引入字体 */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');

/* 全局样式 */
body {
  font-family: 'JetBrains Mono', monospace;
  background-color: #0a0a0f;
  color: #e5e5e5;
}

h1,
h2,
h3,
h4 {
  font-family: 'Orbitron', sans-serif;
}
</style>
