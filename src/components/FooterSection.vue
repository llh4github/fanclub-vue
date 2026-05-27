<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-carrots">
        <span v-for="n in 5" :key="n" class="carrot" :style="{ animationDelay: `${n * 0.15}s` }"
          >🥕</span
        >
      </div>
      <p class="footer-text"><span class="footer-name">莉蔻 liko</span> · 侏儒兔见习杀手</p>
      <div class="footer-icp">
        <p class="icp-text">蜀ICP备2026012083号</p>
        <div class="icp-gov">
          <img src="@/assets/备案图标.png" alt="备案图标" class="icp-icon" />
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=51132102000350"
            rel="noreferrer"
            target="_blank"
            class="icp-link"
            >川公网安备51132102000350号</a
          >
        </div>
      </div>
      <p class="footer-copy">© {{ currentYear }} 莉蔻的绝密档案 · All Rights Reserved</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 3rem 2rem 2rem;
  text-align: center;
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 2rem;
}

.footer::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(102, 126, 234, 0.6),
    rgba(139, 92, 246, 0.6),
    rgba(6, 182, 212, 0.6),
    transparent
  );
}

@media (max-width: 1024px) {
  .footer {
    padding-bottom: 5rem;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 2rem 1rem 5rem;
  }

  .footer-text {
    font-size: 0.8rem;
  }

  .carrot {
    font-size: 1rem;
  }
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.02);
}

.footer-carrots {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.carrot {
  animation: carrotWave 2s ease-in-out infinite;
  display: inline-block;
  font-size: 1.2rem;
}

@keyframes carrotWave {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-4px) rotate(-10deg);
  }
  75% {
    transform: translateY(-4px) rotate(10deg);
  }
}

.footer-text {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.footer-name {
  background: linear-gradient(135deg, #E11D48, #FB7185, #8B5CF6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 600;
  text-shadow: 0 0 20px rgba(225, 29, 72, 0.3);
}

.footer-contact {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
}

.footer-copy {
  margin: 0;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.25);
}

.footer-fan {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.fan-badge {
  background: linear-gradient(135deg, #667eea, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 600;
}

.footer-icp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

.icp-text {
  margin: 0;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.35);
}

.icp-gov {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.icp-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.icp-link {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  transition: color 0.2s ease;
}

.icp-link:hover {
  background: linear-gradient(135deg, #667eea, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style>
