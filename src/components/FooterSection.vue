<script setup lang="ts">
import IconStar from "@/components/icons/IconStar.vue"
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <!-- Decorative lines -->
    <div class="footer-decoration">
      <span class="deco-line left"></span>
      <span class="deco-symbol">◆</span>
      <span class="deco-line right"></span>
    </div>

    <div class="footer-content">
      <!-- Stars -->
      <div class="footer-stars">
        <IconStar v-for="n in 5" :key="n" :size="18" class="star-icon" :fillColor="'rgba(0, 245, 255, 0.6)'" :style="{ animationDelay: `${n * 0.2}s` }" />
      </div>

      <!-- Name with glitch effect -->
      <p class="footer-name">
        <span class="name-text">莉蔻 liko</span>
        <span class="name-sub">· 侏儒兔见习杀手</span>
      </p>

      <!-- ICP section -->
      <div class="footer-icp">
        <p class="icp-text">
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=51132102000350"
            rel="noreferrer"
            target="_blank"
            class="icp-link"
          >
            蜀ICP备2026012083号
          </a>
          <span class="icp-divider">|</span>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=51132102000350"
            rel="noreferrer"
            target="_blank"
            class="icp-link"
          >
            川公网安备51132102000350号
          </a>
        </p>
      </div>

      <!-- Copyright -->
      <p class="footer-copy">© {{ currentYear }} 莉蔻的绝密档案 · All Rights Reserved</p>
    </div>

    <!-- Bottom border animation -->
    <div class="footer-border"></div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 4rem 2rem 3rem;
  position: relative;
  background: rgba(5, 5, 16, 0.95);
  text-align: center;
}

.footer-decoration {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.deco-line {
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
  animation: line-glow 3s ease-in-out infinite;
}

@keyframes line-glow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.deco-line.left {
  background: linear-gradient(90deg, transparent, #ff6b35);
}

.deco-line.right {
  background: linear-gradient(90deg, #ff6b35, transparent);
}

.deco-symbol {
  color: #8b5cf6;
  font-size: 0.8rem;
  animation: symbol-pulse 2s ease-in-out infinite;
}

@keyframes symbol-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  background: rgba(10, 8, 18, 0.8);
  position: relative;
}

.footer-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
}

/* Stars animation */
.footer-stars {
  display: flex;
  gap: 0.8rem;
}

.star-icon {
  color: rgba(0, 245, 255, 0.6);
  animation: star-float 3s ease-in-out infinite;
  display: inline-block;
}

@keyframes star-float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-6px) scale(1.1);
    opacity: 1;
  }
}

/* Name styling */
.footer-name {
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.name-text {
  background: linear-gradient(135deg, #00f5ff, #8b5cf6, #ff6b35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 1.2rem;
  text-shadow: none;
  animation: name-glitch 5s ease-in-out infinite;
}

@keyframes name-glitch {
  0%, 95%, 100% { transform: translate(0); filter: none; }
  96% { transform: translate(-1px, 1px); filter: hue-rotate(90deg); }
  98% { transform: translate(1px, -1px); filter: hue-rotate(-90deg); }
}

.name-sub {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

/* ICP section */
.footer-icp {
  margin-top: 0.5rem;
}

.icp-text {
  margin: 0;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.icp-link {
  color: rgba(0, 245, 255, 0.4);
  text-decoration: none;
  transition: all 0.3s ease;
}

.icp-link:hover {
  color: #00f5ff;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
}

.icp-divider {
  color: rgba(139, 92, 246, 0.3);
}

/* Copyright */
.footer-copy {
  margin: 0;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
}

/* Bottom border */
.footer-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    rgba(139, 92, 246, 0.5),
    rgba(0, 245, 255, 0.5),
    rgba(255, 107, 53, 0.5),
    transparent);
  animation: border-flow 4s linear infinite;
}

@keyframes border-flow {
  0% { transform: scaleX(0); transform-origin: left; }
  50% { transform: scaleX(1); transform-origin: left; }
  50.001% { transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}

@media (max-width: 768px) {
  .footer {
    padding: 3rem 1rem 5rem;
  }

  .footer-content {
    padding: 1.5rem 1rem;
  }

  .deco-line {
    width: 60px;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 2rem 1rem 5rem;
  }

  .deco-line {
    width: 40px;
  }

  .name-text {
    font-size: 1rem;
  }

  .star-icon {
    width: 14px;
    height: 14px;
  }
}
</style>