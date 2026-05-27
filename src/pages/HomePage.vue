<script setup lang="ts">
import ParticleBackground from "@/components/ParticleBackground.vue"
import HeroSection from "@/components/HeroSection.vue"
import ScheduleSection from "@/components/ScheduleSection.vue"
import SonglistSection from "@/components/SonglistSection.vue"
import FooterSection from "@/components/FooterSection.vue"
import ScBvChecker from "@/components/ScBvChecker.vue"
import { VGlass } from "@daisigu/vue-liquid-glass"
import IconHome from "@/components/icons/IconHome.vue"
import IconCalendar from "@/components/icons/IconCalendar.vue"
import IconMusic from "@/components/icons/IconMusic.vue"
import IconSettings from "@/components/icons/IconSettings.vue"
</script>

<template>
  <div class="home-page">
    <ParticleBackground />

    <VGlass class="side-nav" :blur="16" :scale="20" :base-frequency="0.015" :radius="16">
      <a href="#home" class="nav-dot" title="首页" aria-label="首页">
        <span class="dot">
          <IconHome :size="18" />
        </span>
        <span class="nav-label">首页</span>
      </a>
      <a href="#schedule" class="nav-dot" title="日程" aria-label="日程">
        <span class="dot">
          <IconCalendar :size="18" />
        </span>
        <span class="nav-label">日程</span>
      </a>
      <a href="#playlist" class="nav-dot" title="歌单" aria-label="歌单">
        <span class="dot">
          <IconMusic :size="18" />
        </span>
        <span class="nav-label">歌单</span>
      </a>
    </VGlass>

    <div class="content-wrapper">
      <HeroSection />
      <ScheduleSection />
      <SonglistSection />
      <FooterSection />
    </div>

    <!-- Mobile bottom nav -->
    <nav class="mobile-nav" aria-label="移动端导航">
      <a href="#home" class="mobile-nav-item" aria-label="首页">
        <span class="mobile-nav-icon">
          <IconHome :size="22" />
        </span>
        <span class="mobile-nav-label">首页</span>
      </a>
      <a href="#schedule" class="mobile-nav-item" aria-label="日程">
        <span class="mobile-nav-icon">
          <IconCalendar :size="22" />
        </span>
        <span class="mobile-nav-label">日程</span>
      </a>
      <a href="#playlist" class="mobile-nav-item" aria-label="歌单">
        <span class="mobile-nav-icon">
          <IconMusic :size="22" />
        </span>
        <span class="mobile-nav-label">歌单</span>
      </a>
    </nav>

    <!-- Admin entry - top right corner -->
    <router-link to="/admin" class="admin-link" title="后台管理" aria-label="后台管理">
      <span class="admin-link-icon">
        <IconSettings :size="18" />
      </span>
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
  max-width: 900px;
  margin: 0 auto;
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  color: rgba(196, 181, 253, 0.4);
}

.dot::before {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(102, 126, 234, 0.3);
  opacity: 0;
  transition: all 0.3s ease;
}

.nav-dot:hover .dot {
  color: rgba(196, 181, 253, 0.9);
  transform: scale(1.15);
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
}

.nav-dot:hover .dot::before {
  opacity: 1;
  transform: scale(1.2);
  border-color: rgba(139, 92, 246, 0.5);
}

/* Nav label - Glass style */
.nav-label {
  position: absolute;
  left: 20px;
  font-size: 0.75rem;
  color: rgba(196, 181, 253, 0.5);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.2s ease;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-dot:hover .nav-label {
  opacity: 1;
  transform: translateX(0);
}

.admin-link {
  position: fixed;
  top: 1.2rem;
  right: 1.5rem;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.admin-link:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.25);
}

.admin-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(6, 182, 212, 0.5);
  transition: all 0.3s ease;
}

.admin-link:hover .admin-link-icon {
  color: rgba(6, 182, 212, 0.9);
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
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom));
  justify-content: space-around;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  padding: 0.3rem 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 0;
  flex: 1;
}

.mobile-nav-item:active {
  background: rgba(139, 92, 246, 0.15);
}

.mobile-nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(196, 181, 253, 0.5);
  transition: all 0.2s ease;
}

.mobile-nav-item:hover .mobile-nav-icon {
  color: rgba(196, 181, 253, 0.9);
  filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.5));
}

.mobile-nav-label {
  font-size: 0.6rem;
  color: rgba(196, 181, 253, 0.4);
  white-space: nowrap;
  transition: color 0.2s ease;
}

.mobile-nav-item:hover .mobile-nav-label {
  color: rgba(6, 182, 212, 0.8);
}

@media (max-width: 768px) {
  .side-nav {
    display: none;
  }

  .mobile-nav {
    display: flex;
  }

  .content-wrapper {
    padding-bottom: 4rem;
  }

  .admin-link {
    top: 0.8rem;
    right: 1rem;
    width: 44px;
    height: 44px;
  }

  .admin-link-icon {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .admin-link {
    top: 0.6rem;
    right: 0.8rem;
    width: 44px;
    height: 44px;
  }

  .admin-link-icon {
    font-size: 0.8rem;
  }
}
</style>
