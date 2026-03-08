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
      <Navigation />
      <div class="flex flex-col flex-grow items-center justify-center">
        <Hero />
        <main class="w-full max-w-3xl flex flex-col gap-12">
          <Timeline />
          <Projects />
          <About />
          <Contact />
        </main>
      </div>
      <Footer />
    </FlickeringGrid>
  </div>
</template>

<script setup lang="ts">
import Navigation from './Navigation.vue'
import Hero from './Hero.vue'
import About from './About.vue'
import Timeline from './Timeline.vue'
import Projects from './Projects.vue'
import Contact from './Contact.vue'
import Footer from './Footer.vue'
</script>

<style scoped>
/* 引入衬线字体 */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

button {
  background: transparent !important;
  border: none !important;
}

/* 使用衬线字体 */
* {
  font-family: 'Playfair Display', serif;
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
