<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import * as THREE from "three"

const canvasRef = ref<HTMLCanvasElement>()
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animationId: number | null = null
let mouseX = 0
let mouseY = 0
let particles: THREE.Points | null = null
let sparkleParticles: THREE.Points | null = null
let hexParticles: THREE.Points | null = null
let nebulaMesh: THREE.Mesh | null = null
let destroyed = false

const GLASS_BLUE = new THREE.Color("#3b82f6")
const GLASS_PURPLE = new THREE.Color("#8b5cf6")
const GLASS_CYAN = new THREE.Color("#06b6d4")
const GLASS_INDIGO = new THREE.Color("#6366f1")
const GLASS_WHITE = new THREE.Color("#e0e7ff")
const GLASS_PINK = new THREE.Color("#c084fc")

function createStarTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const center = size / 2

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, "rgba(255,255,255,1)")
  gradient.addColorStop(0.2, "rgba(196,231,255,0.8)")
  gradient.addColorStop(0.5, "rgba(99,179,237,0.3)")
  gradient.addColorStop(1, "rgba(99,179,237,0)")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2
    ctx.moveTo(center, center)
    ctx.lineTo(center + Math.cos(angle) * center * 0.8, center + Math.sin(angle) * center * 0.8)
  }
  ctx.strokeStyle = "rgba(255,255,255,0.5)"
  ctx.lineWidth = 1
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function createHeartTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!

  ctx.beginPath()
  const x = size / 2
  const y = size / 2 - 4
  const w = 12
  const h = 12
  ctx.moveTo(x, y + h)
  ctx.bezierCurveTo(x, y + h, x - w, y, x - w, y - h / 2)
  ctx.bezierCurveTo(x - w, y - h, x, y - h, x, y - h / 4)
  ctx.bezierCurveTo(x, y - h, x + w, y - h, x + w, y - h / 2)
  ctx.bezierCurveTo(x + w, y, x, y + h, x, y + h)

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, w)
  gradient.addColorStop(0, "rgba(192,132,252,0.9)")
  gradient.addColorStop(0.5, "rgba(192,132,252,0.5)")
  gradient.addColorStop(1, "rgba(192,132,252,0)")

  ctx.fillStyle = gradient
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function createHexagonTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const center = size / 2
  const radius = 20

  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6
    const x = center + Math.cos(angle) * radius
    const y = center + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius)
  gradient.addColorStop(0, "rgba(139,92,246,0.7)")
  gradient.addColorStop(0.7, "rgba(139,92,246,0.35)")
  gradient.addColorStop(1, "rgba(139,92,246,0)")

  ctx.fillStyle = gradient
  ctx.fill()

  ctx.strokeStyle = "rgba(167,139,250,0.5)"
  ctx.lineWidth = 1.5
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function createNebulaTexture(): THREE.Texture {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!

  const centerX = size / 2
  const centerY = size / 2

  for (let i = 0; i < 50; i++) {
    const x = centerX + (Math.random() - 0.5) * size * 0.8
    const y = centerY + (Math.random() - 0.5) * size * 0.8
    const radius = Math.random() * 15 + 5

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    const alpha = Math.random() * 0.08 + 0.03
    const colors = [
      `rgba(6,182,212,${alpha})`,
      `rgba(139,92,246,${alpha})`,
      `rgba(192,132,252,${alpha})`,
      `rgba(99,102,241,${alpha})`,
    ]
    gradient.addColorStop(0, colors[Math.floor(Math.random() * colors.length)])
    gradient.addColorStop(1, "transparent")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function init() {
  if (!canvasRef.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 30

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true,
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const starTexture = createStarTexture()
  const count = 200
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  const colorOptions = [GLASS_BLUE, GLASS_PURPLE, GLASS_CYAN, GLASS_INDIGO, GLASS_WHITE]

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40

    const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b

    sizes[i] = Math.random() * 2 + 0.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 1.5,
    map: starTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    sizeAttenuation: true,
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  const heartTexture = createHeartTexture()
  const sparkleCount = 60
  const sparklePositions = new Float32Array(sparkleCount * 3)
  const sparkleSizes = new Float32Array(sparkleCount)

  for (let i = 0; i < sparkleCount; i++) {
    sparklePositions[i * 3] = (Math.random() - 0.5) * 60
    sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 60
    sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 30
    sparkleSizes[i] = Math.random() * 2 + 1
  }

  const sparkleGeometry = new THREE.BufferGeometry()
  sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3))
  sparkleGeometry.setAttribute("size", new THREE.BufferAttribute(sparkleSizes, 1))

  const sparkleMaterial = new THREE.PointsMaterial({
    size: 2,
    map: heartTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: GLASS_PINK,
    sizeAttenuation: true,
  })

  sparkleParticles = new THREE.Points(sparkleGeometry, sparkleMaterial)
  scene.add(sparkleParticles)

  const hexagonTexture = createHexagonTexture()
  const hexCount = 30
  const hexPositions = new Float32Array(hexCount * 3)
  const hexSizes = new Float32Array(hexCount)
  const hexColors = new Float32Array(hexCount * 3)

  const alienColors = [GLASS_PURPLE, GLASS_CYAN, GLASS_INDIGO]

  for (let i = 0; i < hexCount; i++) {
    hexPositions[i * 3] = (Math.random() - 0.5) * 70
    hexPositions[i * 3 + 1] = (Math.random() - 0.5) * 70
    hexPositions[i * 3 + 2] = (Math.random() - 0.5) * 35
    hexSizes[i] = Math.random() * 3 + 1

    const color = alienColors[Math.floor(Math.random() * alienColors.length)]
    hexColors[i * 3] = color.r
    hexColors[i * 3 + 1] = color.g
    hexColors[i * 3 + 2] = color.b
  }

  const hexGeometry = new THREE.BufferGeometry()
  hexGeometry.setAttribute("position", new THREE.BufferAttribute(hexPositions, 3))
  hexGeometry.setAttribute("size", new THREE.BufferAttribute(hexSizes, 1))
  hexGeometry.setAttribute("color", new THREE.BufferAttribute(hexColors, 3))

  const hexMaterial = new THREE.PointsMaterial({
    size: 2,
    map: hexagonTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    sizeAttenuation: true,
  })

  hexParticles = new THREE.Points(hexGeometry, hexMaterial)
  scene.add(hexParticles)

  const nebulaTexture = createNebulaTexture()
  const nebulaGeometry = new THREE.PlaneGeometry(200, 200)
  const nebulaMaterial = new THREE.MeshBasicMaterial({
    map: nebulaTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.25,
    side: THREE.DoubleSide,
  })

  nebulaMesh = new THREE.Mesh(nebulaGeometry, nebulaMaterial)
  nebulaMesh.position.z = -30
  scene.add(nebulaMesh)

  window.addEventListener("resize", onResize)
  window.addEventListener("mousemove", onMouseMove)
  animate()
}

function animate() {
  if (destroyed) return
  animationId = requestAnimationFrame(animate)

  if (!scene || !camera || !renderer) return

  const time = Date.now() * 0.001

  if (particles) {
    const positions = particles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + positions[i] * 0.5) * 0.008
      positions[i] += Math.cos(time * 0.5 + positions[i + 1] * 0.3) * 0.005
    }
    particles.geometry.attributes.position.needsUpdate = true
    particles.rotation.y = time * 0.02
    particles.rotation.x = time * 0.01
  }

  if (sparkleParticles) {
    const positions = sparkleParticles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time * 0.8 + positions[i] * 0.4) * 0.01
      positions[i] += Math.cos(time * 0.3 + positions[i + 1]) * 0.008
    }
    sparkleParticles.geometry.attributes.position.needsUpdate = true
    sparkleParticles.rotation.y = -time * 0.015
  }

  if (hexParticles) {
    const positions = hexParticles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time * 0.6 + positions[i] * 0.3) * 0.005
      positions[i] += Math.cos(time * 0.4 + positions[i + 1] * 0.2) * 0.004
    }
    hexParticles.geometry.attributes.position.needsUpdate = true
    hexParticles.rotation.z = time * 0.03
    hexParticles.rotation.x = time * 0.02
  }

  if (nebulaMesh) {
    nebulaMesh.rotation.z = time * 0.005
    const material = nebulaMesh.material as THREE.MeshBasicMaterial
    material.opacity = 0.2 + Math.sin(time * 0.3) * 0.05
  }

  camera.position.x += (mouseX * 5 - camera.position.x) * 0.02
  camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}

function onResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMouseMove(event: MouseEvent) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = (event.clientY / window.innerHeight) * 2 - 1
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  destroyed = true
  if (animationId !== null) cancelAnimationFrame(animationId)
  window.removeEventListener("resize", onResize)
  window.removeEventListener("mousemove", onMouseMove)
  if (renderer) renderer.dispose()
  renderer = null
  scene = null
  camera = null
  particles = null
  sparkleParticles = null
  hexParticles = null
  nebulaMesh = null
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-canvas" />
</template>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
