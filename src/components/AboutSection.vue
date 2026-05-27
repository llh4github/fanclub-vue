<script setup lang="ts">
import { ref, onMounted } from "vue"
import { VGlass } from "@daisigu/vue-liquid-glass"

const sectionRef = ref<HTMLElement>()
const isVisible = ref(false)

const features = [
  {
    icon: "🎤",
    title: "歌势担当",
    desc: "擅长多种曲风，用歌声治愈心灵",
    color: "#E11D48",
  },
  {
    icon: "🎮",
    title: "游戏实况",
    desc: "偶尔的游戏直播，笑料不断",
    color: "#8B5CF6",
  },
  {
    icon: "🎨",
    title: "创作达人",
    desc: "画画、作曲全能型虚拟主播",
    color: "#2563EB",
  },
]

const stats = [
  { value: "2023", label: "出道年份" },
  { value: "8月3日", label: "生日" },
  { value: "VR所属", label: "经纪公司" },
]

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
        }
      })
    },
    { threshold: 0.15 },
  )
  if (sectionRef.value) {
    observer.observe(sectionRef.value)
  }
})
</script>

<template>
  <section ref="sectionRef" id="about" class="about-section" :class="{ visible: isVisible }">
    <h2 class="section-title">
      <a href="#about" class="anchor-link" title="链接到关于">
        <span class="anchor-icon">🔗</span>
      </a>
      <span class="title-icon">💝</span>
      关于莉蔻
    </h2>

    <div class="about-content">
      <VGlass class="about-intro" :blur="12" :scale="30" :base-frequency="0.015" :radius="20">
        <div class="intro-text">
          <p class="intro-main">
            大家好，我是<span class="highlight">莉蔻 (Liko)</span>，来自胡萝卜星云的侏儒兔见习杀手。
          </p>
          <p class="intro-sub">
            现在的任务是收集地球粉丝，已经收集了{{ stats[0].value }}个啦！
            平时喜欢唱歌、打游戏，也会画一些有趣的东西。
          </p>
        </div>
        <div class="intro-tags">
          <span v-for="stat in stats" :key="stat.label" class="tag-item">
            <span class="tag-value">{{ stat.value }}</span>
            <span class="tag-label">{{ stat.label }}</span>
          </span>
        </div>
      </VGlass>

      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="feature-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <VGlass
            class="feature-glass"
            :blur="10"
            :scale="25"
            :base-frequency="0.015"
            :radius="16"
          >
            <div class="feature-icon" :style="{ background: feature.color }">
              {{ feature.icon }}
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </VGlass>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  scroll-margin-top: 2rem;
}

.about-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
}

.anchor-link {
  text-decoration: none;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 0.8rem;
}

.section-title:hover .anchor-link {
  opacity: 0.6;
}

.anchor-icon {
  font-size: 0.9rem;
}

.title-icon {
  font-size: 1.5rem;
  animation: pulse-icon 2s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.about-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-intro {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.intro-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.intro-main {
  font-size: 1.1rem;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.6;
}

.intro-sub {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.highlight {
  background: linear-gradient(135deg, #E11D48, #FB7185);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

.intro-tags {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tag-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(225, 29, 72, 0.15);
  border-radius: 10px;
}

.tag-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tag-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.feature-card {
  animation: fadeInUp 0.6s ease both;
}

.feature-glass {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  height: 100%;
  transition: all var(--duration-normal) var(--ease-out);
}

.feature-glass:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(225, 29, 72, 0.15);
}

.feature-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.feature-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.feature-desc {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .about-section {
    padding: 3rem 0;
    gap: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .about-intro {
    padding: 1.5rem;
  }

  .intro-main {
    font-size: 1rem;
  }

  .intro-sub {
    font-size: 0.9rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-glass {
    padding: 1.25rem;
    flex-direction: row;
    text-align: left;
    gap: 1rem;
  }

  .feature-icon {
    font-size: 1.5rem;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  .feature-title {
    font-size: 0.95rem;
  }

  .feature-desc {
    font-size: 0.8rem;
  }
}
</style>