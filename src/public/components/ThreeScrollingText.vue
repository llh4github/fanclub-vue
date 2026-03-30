<template>
  <div
    ref="containerRef"
    class="three-scrolling-text absolute inset-0 pointer-events-none overflow-hidden"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";

const containerRef = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationId: number;

interface Danmaku {
  mesh: THREE.Mesh;
  speed: number;
  width: number;
  startX: number;
}

let danmakus: Danmaku[] = [];

// 发送者名称列表
const senderNames = [
  "小兔子",
  "蔻萝特",
  "莉蔻粉丝",
  "兔子窝成员",
  "可爱的观众",
  "支持莉蔻",
  "弹幕达人",
  "超级粉丝",
  "莉蔻的小迷妹",
  "兔子窝守护者",
];

// 弹幕内容列表
const danmakuTexts = [
  "莉蔻好可爱！",
  "兔子窝赛高！",
  "莉蔻最棒！",
  "支持莉蔻！",
  "莉蔻加油！",
  "兔子窝万岁！",
  "莉蔻可爱到爆！",
  "永远支持莉蔻！",
  "莉蔻是最棒的！",
  "兔子窝越来越火！",
  "蒄爆VR！",
  "莉蔻冲鸭！",
  "兔子窝永远的神！",
  "莉蔻yyds！",
  "支持莉蔻每一天！",
];

// 使用更亮的颜色
const colors = [
  0xffffff, // 纯白
  0xff6b6b, // 亮红
  0x4ecdc4, // 青绿
  0xff9f43, // 橙色
  0x54a0ff, // 亮蓝
  0x5f27cd, // 紫色
  0xfeca57, // 黄色
  0xff6348, // 番茄红
  0x2ed573, // 亮绿
  0x1dd1a1, // 青蓝
];

onMounted(() => {
  if (!containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = null; // 透明背景

  // 创建相机 - 调整相机位置以获得更好的视角
  camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
  camera.position.z = 30;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  containerRef.value.appendChild(renderer.domElement);

  // 初始创建一些弹幕
  for (let i = 0; i < 6; i++) {
    setTimeout(() => createDanmaku(), i * 1000);
  }

  // 开始动画循环
  animate();

  // 定时创建新弹幕
  const interval = setInterval(() => {
    if (danmakus.length < 12) {
      createDanmaku();
    }
  }, 1500);

  // 响应窗口大小变化
  const onResize = () => {
    if (!containerRef.value) return;
    const newWidth = containerRef.value.clientWidth;
    const newHeight = containerRef.value.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };
  window.addEventListener("resize", onResize);

  // 保存清理函数
  const cleanup = () => {
    clearInterval(interval);
    window.removeEventListener("resize", onResize);
  };

  // 在unmounted时调用清理
  onUnmounted(() => {
    cleanup();
    cancelAnimationFrame(animationId);

    if (containerRef.value && renderer) {
      containerRef.value.removeChild(renderer.domElement);
    }

    // 清理所有弹幕
    danmakus.forEach((d) => {
      scene.remove(d.mesh);
      if (d.mesh.geometry) d.mesh.geometry.dispose();
      if (d.mesh.material) {
        if (Array.isArray(d.mesh.material)) {
          d.mesh.material.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (d.mesh.material.map) d.mesh.material.map.dispose();
          d.mesh.material.dispose();
        }
      }
    });
    danmakus = [];

    if (renderer) {
      renderer.dispose();
    }
  });
});

function createDanmaku() {
  if (!scene) return;

  // 随机选择弹幕内容
  const text = danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // 字体大小
  const contentSize = 2 + Math.random() * 8;

  // 限制垂直范围，避免遮挡主要内容
  const yPos = (Math.random() - 0.5) * 12;
  const speed = 0.05 + Math.random() * 0.05;

  // 创建3D文字
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.width = 1024;
  canvas.height = 256;

  // 绘制文字到canvas
  context.fillStyle = "rgba(0, 0, 0, 0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制弹幕内容
  context.font = `bold ${contentSize}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  // 弹幕内容描边
  context.lineWidth = 3;
  context.strokeStyle = "#000000";
  context.strokeText(text, canvas.width / 2, canvas.height / 2);

  // 弹幕内容填充
  context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  // 创建平面几何体显示文字
  const geometry = new THREE.PlaneGeometry(canvas.width / 10, canvas.height / 10);
  // 添加最高80%的随机透明度（0.8-1.0）
  const opacity = 0.7 + Math.random() * 0.2;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // 设置初始位置（右侧屏幕外）
  const startX = 30 + Math.random() * 5;
  mesh.position.x = startX;
  mesh.position.y = yPos;
  mesh.position.z = Math.random() * 100 - 50; // 随机深度

  // 添加随机旋转
  mesh.rotation.y = Math.random() * 0.2 - 0.1;
  mesh.rotation.z = Math.random() * 0.1 - 0.05;

  // 添加到场景
  scene.add(mesh);

  // 计算弹幕宽度
  const textWidth = context.measureText(text).width;
  const planeWidth = textWidth / 10;

  danmakus.push({
    mesh,
    speed,
    width: planeWidth,
    startX: startX,
  });
}

function animate() {
  animationId = requestAnimationFrame(animate);

  // 更新所有弹幕位置
  for (let i = danmakus.length - 1; i >= 0; i--) {
    const d = danmakus[i];
    d.mesh.position.x -= d.speed;

    // 如果弹幕完全滚出左侧屏幕，移除它
    if (d.mesh.position.x < -30) {
      scene.remove(d.mesh);
      if (d.mesh.geometry) d.mesh.geometry.dispose();
      if (d.mesh.material) {
        if (Array.isArray(d.mesh.material)) {
          d.mesh.material.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (d.mesh.material.map) d.mesh.material.map.dispose();
          d.mesh.material.dispose();
        }
      }
      danmakus.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}
</script>

<style scoped>
.three-scrolling-text {
  z-index: 1;
}

.three-scrolling-text canvas {
  display: block;
}
</style>
