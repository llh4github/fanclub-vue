<script setup lang="ts">
import ParticleBackground from "@/components/ParticleBackground.vue"
import HeroSection from "@/components/HeroSection.vue"
import ScheduleSection from "@/components/ScheduleSection.vue"
import SonglistSection from "@/components/SonglistSection.vue"
import FooterSection from "@/components/FooterSection.vue"
import ScBvChecker from "@/components/ScBvChecker.vue"
import IconHome from "@/components/icons/IconHome.vue"
import IconCalendar from "@/components/icons/IconCalendar.vue"
import IconMusic from "@/components/icons/IconMusic.vue"
import IconSettings from "@/components/icons/IconSettings.vue"
</script>

<template>
  <div class="home-page">
    <ParticleBackground />

    <!-- Floating geometric decorations -->
    <div class="geo-decorations">
      <div class="hex hex-1"></div>
      <div class="hex hex-2"></div>
      <div class="hex hex-3"></div>
      <div class="triangle triangle-1"></div>
      <div class="circle circle-1"></div>
      <!-- Rabbit and carrot decorations -->
      <svg class="rabbit rabbit-1" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="18" rx="6" ry="16" stroke="#ff6b35" stroke-width="2" fill="none" opacity="0.6"/>
        <ellipse cx="42" cy="18" rx="6" ry="16" stroke="#ff6b35" stroke-width="2" fill="none" opacity="0.6"/>
        <ellipse cx="32" cy="40" rx="16" ry="18" stroke="#ff6b35" stroke-width="2" fill="none" opacity="0.5"/>
        <circle cx="26" cy="36" r="2" fill="#ff6b35" opacity="0.8"/>
        <circle cx="38" cy="36" r="2" fill="#ff6b35" opacity="0.8"/>
        <ellipse cx="32" cy="44" rx="4" ry="3" stroke="#ff6b35" stroke-width="1.5" fill="none" opacity="0.6"/>
      </svg>
      <svg class="carrot carrot-1" viewBox="0 0 32 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8 L24 56 L16 60 L8 56 Z" stroke="#00f5ff" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M12 8 Q16 4 20 8" stroke="#00f5ff" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M10 12 Q16 6 22 12" stroke="#00f5ff" stroke-width="1.5" fill="none" opacity="0.4"/>
        <line x1="14" y1="20" x2="18" y2="20" stroke="#00f5ff" stroke-width="1" opacity="0.5"/>
        <line x1="13" y1="30" x2="19" y2="30" stroke="#00f5ff" stroke-width="1" opacity="0.5"/>
        <line x1="14" y1="40" x2="18" y2="40" stroke="#00f5ff" stroke-width="1" opacity="0.5"/>
      </svg>
    </div>

    <!-- Top right corner admin link -->
    <router-link to="/admin" class="admin-corner" title="后台管理" aria-label="后台管理">
      <span class="admin-icon">
        <IconSettings :size="20" />
      </span>
      <span class="admin-text">ADMIN</span>
      <span class="admin-line"></span>
    </router-link>

    <div class="content-wrapper">
      <HeroSection />
      <ScheduleSection />
      <SonglistSection />
      <FooterSection />
    </div>

    <!-- Bottom navigation bar - cyberpunk style -->
    <nav class="bottom-nav" aria-label="主导航">
      <a href="#home" class="nav-item" aria-label="首页">
        <span class="nav-icon">
          <IconHome :size="24" />
        </span>
        <span class="nav-text">首页</span>
        <span class="nav-indicator"></span>
      </a>
      <a href="#schedule" class="nav-item" aria-label="日程">
        <span class="nav-icon">
          <IconCalendar :size="24" />
        </span>
        <span class="nav-text">日程</span>
        <span class="nav-indicator"></span>
      </a>
      <a href="#playlist" class="nav-item" aria-label="歌单">
        <span class="nav-icon">
          <IconMusic :size="24" />
        </span>
        <span class="nav-text">歌单</span>
        <span class="nav-indicator"></span>
      </a>
    </nav>

    <!-- SC BV Checker -->
    <ScBvChecker />
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem 0 4rem;
}

/* Padding for left side nav */
@media (min-width: 769px) {
  .content-wrapper {
    padding-left: 5rem;
  }
}

/* Geometric decorations */
.geo-decorations {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.hex {
  position: absolute;
  width: 100px;
  height: 115px;
  background: linear-gradient(135deg,
    rgba(0, 245, 255, 0.1) 0%,
    rgba(139, 92, 246, 0.05) 100%);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  animation: float 8s ease-in-out infinite;
}

.hex-1 {
  top: 15%;
  left: 5%;
  animation-delay: 0s;
}

.hex-2 {
  top: 60%;
  right: 3%;
  width: 80px;
  height: 92px;
  animation-delay: 2s;
}

.hex-3 {
  bottom: 20%;
  left: 8%;
  width: 60px;
  height: 69px;
  animation-delay: 4s;
}

.triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-bottom: 70px solid rgba(255, 107, 53, 0.08);
  animation: float 10s ease-in-out infinite;
}

.triangle-1 {
  top: 30%;
  right: 10%;
  animation-delay: 1s;
}

.circle {
  position: absolute;
  border: 2px solid rgba(0, 245, 255, 0.15);
  border-radius: 50%;
  animation: rotate-slow 30s linear infinite;
}

.circle-1 {
  top: 20%;
  right: 20%;
  width: 150px;
  height: 150px;
  animation-duration: 40s;
}

/* Rabbit and carrot decorations */
.rabbit {
  position: absolute;
  animation: float 6s ease-in-out infinite;
  opacity: 0.7;
}

.rabbit-1 {
  width: 80px;
  height: 80px;
  bottom: 15%;
  right: 8%;
  animation-delay: 1s;
}

.carrot {
  position: absolute;
  animation: float 7s ease-in-out infinite;
  opacity: 0.6;
}

.carrot-1 {
  width: 40px;
  height: 80px;
  top: 25%;
  left: 12%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(3deg);
  }
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Admin corner link - top right */
.admin-corner {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  padding: 0.6rem 1rem;
  background: rgba(10, 8, 18, 0.9);
  border: 1px solid rgba(139, 92, 246, 0.4);
  transition: all 0.3s ease;
}

.admin-corner::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #00f5ff, #8b5cf6);
}

.admin-corner:hover {
  border-color: rgba(0, 245, 255, 0.6);
  box-shadow:
    0 0 20px rgba(0, 245, 255, 0.2),
    inset 0 0 20px rgba(0, 245, 255, 0.05);
}

.admin-icon {
  display: flex;
  align-items: center;
  color: rgba(139, 92, 246, 0.8);
  transition: all 0.3s ease;
}

.admin-corner:hover .admin-icon {
  color: #00f5ff;
  transform: rotate(90deg);
}

.admin-text {
  font-family: var(--font-display, 'Orbitron', sans-serif);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(139, 92, 246, 0.8);
  transition: all 0.3s ease;
}

.admin-corner:hover .admin-text {
  color: #00f5ff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
}

.admin-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
  transition: all 0.3s ease;
}

.admin-corner:hover .admin-line {
  left: 0;
  width: 100%;
}

/* Left side navigation bar - collapsed by default */
.bottom-nav {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: rgba(10, 8, 18, 0.95);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-left: none;
  padding: 0.75rem 0.35rem;
  gap: 0.15rem;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 3.5rem;
}

.bottom-nav:hover {
  width: auto;
  border-left: 1px solid rgba(0, 245, 255, 0.3);
  padding-left: 0.5rem;
}

.bottom-nav::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    rgba(0, 245, 255, 0.8),
    rgba(255, 107, 53, 0.8),
    rgba(139, 92, 246, 0.8),
    transparent);
  animation: border-glow 3s ease-in-out infinite;
}

.bottom-nav::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    rgba(0, 245, 255, 0.8),
    rgba(255, 107, 53, 0.8),
    rgba(139, 92, 246, 0.8),
    transparent);
  animation: border-glow 3s ease-in-out infinite;
}

@keyframes border-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.8rem 0.6rem;
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.nav-item .nav-text {
  white-space: nowrap;
  opacity: 0;
  max-width: 0;
  transition: all 0.3s ease;
}

.bottom-nav:hover .nav-item .nav-text {
  opacity: 1;
  max-width: 60px;
  margin-left: 0.5rem;
}

.nav-item::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 2px;
  height: 0;
  background: #00f5ff;
  transition: all 0.3s ease;
}

.nav-item:hover::before,
.nav-item:active::before {
  height: 100%;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.nav-item:hover .nav-icon {
  color: #00f5ff;
  filter: drop-shadow(0 0 8px rgba(0, 245, 255, 0.8));
  transform: scale(1.1);
}

.nav-text {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.nav-item:hover .nav-text {
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
  max-width: 60px;
  opacity: 1;
  margin-left: 0.5rem;
}

.nav-indicator {
  position: absolute;
  bottom: 50%;
  left: 0;
  transform: translateY(50%);
  width: 2px;
  height: 0;
  background: linear-gradient(180deg, transparent, #ff6b35, transparent);
  transition: all 0.3s ease;
}

.nav-item:active .nav-indicator {
  height: 60%;
}

/* Padding for left nav */
.content-wrapper {
  padding-bottom: 2rem;
}

@media (max-width: 768px) {
  .admin-corner {
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 0.8rem;
  }

  .admin-text {
    display: none;
  }

  .content-wrapper {
    padding-bottom: 2rem;
    padding-left: 3.5rem;
  }

  .hex,
  .rabbit,
  .carrot {
    display: none;
  }

  .bottom-nav {
    width: auto;
    left: 0;
    padding: 0.5rem 0.4rem;
    border-left: 1px solid rgba(0, 245, 255, 0.3);
  }

  .bottom-nav:hover {
    width: auto;
    padding: 0.5rem 0.4rem;
  }

  .nav-item {
    padding: 0.6rem 0.5rem;
  }

  .nav-item .nav-text {
    opacity: 1;
    max-width: 60px;
    margin-left: 0.4rem;
  }

  .nav-item:active .nav-indicator {
    height: 60%;
  }
}

@media (max-width: 480px) {
  .admin-corner {
    top: 0.8rem;
    right: 0.8rem;
  }

  .content-wrapper {
    padding-left: 3rem;
  }

  .nav-item {
    padding: 0.5rem 0.4rem;
  }
}
</style>