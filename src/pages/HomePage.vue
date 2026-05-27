<script setup lang="ts">
import ParticleBackground from "@/components/ParticleBackground.vue"
import HeroSection from "@/components/HeroSection.vue"
import AboutSection from "@/components/AboutSection.vue"
import ScheduleSection from "@/components/ScheduleSection.vue"
import SonglistSection from "@/components/SonglistSection.vue"
import FooterSection from "@/components/FooterSection.vue"
import ScBvChecker from "@/components/ScBvChecker.vue"
import { VGlass } from "@daisigu/vue-liquid-glass"
</script>

<template>
  <div class="home-page">
    <ParticleBackground />

    <VGlass class="side-nav" :blur="16" :scale="20" :base-frequency="0.015" :radius="16">
      <a href="#home" class="nav-dot" title="首页">
        <span class="dot">🏠</span>
        <span class="nav-label">首页</span>
      </a>
      <a href="#about" class="nav-dot" title="关于">
        <span class="dot">💝</span>
        <span class="nav-label">关于</span>
      </a>
      <a href="#schedule" class="nav-dot" title="日程">
        <span class="dot">📅</span>
        <span class="nav-label">日程</span>
      </a>
      <a href="#playlist" class="nav-dot" title="歌单">
        <span class="dot">🎵</span>
        <span class="nav-label">歌单</span>
      </a>
      <div class="nav-separator"></div>
      <router-link to="/admin" class="nav-dot nav-admin" title="后台管理">
        <span class="dot dot-admin">⚙</span>
        <span class="nav-label">管理</span>
      </router-link>
    </VGlass>

    <div class="content-wrapper">
      <HeroSection />
      <AboutSection />
      <ScheduleSection />
      <SonglistSection />
      <FooterSection />
    </div>

    <!-- Mobile bottom nav -->
    <nav class="mobile-nav">
      <a href="#home" class="mobile-nav-item">
        <span class="mobile-nav-icon">🏠</span>
        <span class="mobile-nav-label">首页</span>
      </a>
      <a href="#about" class="mobile-nav-item">
        <span class="mobile-nav-icon">💝</span>
        <span class="mobile-nav-label">关于</span>
      </a>
      <a href="#schedule" class="mobile-nav-item">
        <span class="mobile-nav-icon">📅</span>
        <span class="mobile-nav-label">日程</span>
      </a>
      <a href="#playlist" class="mobile-nav-item">
        <span class="mobile-nav-icon">🎵</span>
        <span class="mobile-nav-label">歌单</span>
      </a>
    </nav>

    <!-- Admin entry - top right corner icon only -->
    <router-link to="/admin" class="admin-link" title="后台管理">
      <span class="admin-link-icon">⚙</span>
    </router-link>

    <!-- SC BV Checker -->
    <ScBvChecker />
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Large screen grid layout */
@media (min-width: 1200px) {
  .home-page {
    display: grid;
    grid-template-columns: 80px 1fr;
    grid-template-rows: 1fr;
    gap: 0;
    max-width: 1400px;
    margin: 0 auto;
  }

  .content-wrapper {
    grid-column: 2;
    grid-row: 1;
    padding: 0 2rem 0 0;
    max-width: none;
  }

  .side-nav {
    position: sticky;
    top: 50%;
    transform: translateY(-50%);
    height: fit-content;
    padding: 1.5rem 0.5rem;
  }

  .admin-link {
    display: none;
  }
}

/* Side navigation - Glass morphism */
.side-nav {
  position: fixed;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.2rem 0.8rem;
}

.nav-dot {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  cursor: pointer;
  position: relative;
}

.dot {
  font-size: 1.1rem;
  line-height: 1;
  transition: all var(--duration-normal) var(--ease-out);
  flex-shrink: 0;
  filter: grayscale(0.6) opacity(0.5);
  position: relative;
  z-index: 1;
}

.dot::before {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(225, 29, 72, 0.3);
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-out);
  z-index: -1;
}

.nav-dot:hover .dot {
  filter: grayscale(0) opacity(1);
  transform: scale(1.25);
  filter: drop-shadow(0 0 8px rgba(225, 29, 72, 0.6));
}

.nav-dot:hover .dot::before {
  opacity: 1;
  transform: scale(1.2);
  border-color: rgba(225, 29, 72, 0.5);
}

/* Nav label - Glass style */
.nav-label {
  position: absolute;
  left: 24px;
  font-size: 0.75rem;
  color: rgba(225, 29, 72, 0.8);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-5px);
  transition: all var(--duration-fast) var(--ease-out);
  pointer-events: none;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(225, 29, 72, 0.2);
}

.nav-dot:hover .nav-label {
  opacity: 1;
  transform: translateX(0);
}

/* Side nav separator & admin - Rose accent */
.nav-separator {
  width: 14px;
  height: 1px;
  background: rgba(225, 29, 72, 0.3);
  margin: 0.3rem 0;
}

.dot-admin {
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(139, 92, 246, 0.6);
  background: rgba(139, 92, 246, 0.1);
  border: 1.5px solid rgba(139, 92, 246, 0.3);
  transition: all var(--duration-normal) var(--ease-out);
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.nav-admin:hover .dot-admin {
  color: rgba(225, 29, 72, 0.9);
  background: rgba(225, 29, 72, 0.15);
  border-color: rgba(225, 29, 72, 0.6);
  box-shadow: 0 0 12px rgba(225, 29, 72, 0.4);
  transform: scale(1.2) rotate(90deg);
}

/* Admin link - Glass style */
.admin-link {
  position: fixed;
  top: 1.2rem;
  right: 1.5rem;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(225, 29, 72, 0.2);
  transition: all var(--duration-normal) var(--ease-out);
}

.admin-link:hover {
  background: rgba(225, 29, 72, 0.15);
  border-color: rgba(225, 29, 72, 0.4);
  box-shadow: 0 0 16px rgba(225, 29, 72, 0.25);
}

.admin-link-icon {
  font-size: 1rem;
  line-height: 1;
  color: rgba(139, 92, 246, 0.6);
  transition: all var(--duration-normal) var(--ease-out);
}

.admin-link:hover .admin-link-icon {
  color: rgba(225, 29, 72, 0.9);
  transform: rotate(90deg);
}

/* Mobile bottom nav - Glass style */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(225, 29, 72, 0.15);
  padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom));
  justify-content: space-around;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  padding: 0.4rem 0.6rem;
  border-radius: 10px;
  transition: all var(--duration-fast) var(--ease-out);
  min-width: 0;
  flex: 1;
}

.mobile-nav-item:active {
  background: rgba(225, 29, 72, 0.15);
}

.mobile-nav-icon {
  font-size: 1.2rem;
  line-height: 1;
  transition: all var(--duration-fast) var(--ease-out);
}

.mobile-nav-item:hover .mobile-nav-icon {
  filter: drop-shadow(0 0 6px rgba(225, 29, 72, 0.5));
}

.mobile-nav-label {
  font-size: 0.65rem;
  color: rgba(225, 29, 72, 0.5);
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out);
}

.mobile-nav-item:hover .mobile-nav-label {
  color: rgba(225, 29, 72, 0.9);
}

@media (max-width: 1024px) {
  .side-nav {
    display: none;
  }

  .mobile-nav {
    display: flex;
  }

  .content-wrapper {
    padding-bottom: 5rem;
  }

  .admin-link {
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .admin-link-icon {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .admin-link {
    top: 0.6rem;
    right: 0.8rem;
    width: 26px;
    height: 26px;
  }

  .admin-link-icon {
    font-size: 0.75rem;
  }
}
</style>
