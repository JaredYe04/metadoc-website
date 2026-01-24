<template>
  <div ref="containerRef" class="absolute inset-0 overflow-hidden pointer-events-none">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollObserver } from '../../utils/scrollObserver'

const containerRef = ref(null)
const canvasRef = ref(null)
let canvas, ctx, animationId
let particles = []
let scrollProgress = 0
const particleCount = 150

class Particle {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.vx = (Math.random() - 0.5) * 0.3
    this.vy = (Math.random() - 0.5) * 0.3
    this.radius = Math.random() * 3 + 1
    this.opacity = Math.random() * 0.5 + 0.2
    this.hue = Math.random() * 60 + 200 // 蓝紫色范围
  }

  update() {
    this.x += this.vx * (0.5 + scrollProgress * 0.5)
    this.y += this.vy * (0.5 + scrollProgress * 0.5)

    // 边界反弹
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1

    this.x = Math.max(0, Math.min(canvas.width, this.x))
    this.y = Math.max(0, Math.min(canvas.height, this.y))
    
    // 轻微的浮动效果
    this.y += Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.1 * scrollProgress
  }

  draw() {
    const opacity = this.opacity * (0.5 + scrollProgress * 0.5)
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${opacity})`
    ctx.fill()
    
    // 添加光晕
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius * 3
    )
    gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${opacity * 0.5})`)
    gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`)
    ctx.fillStyle = gradient
    ctx.fillRect(this.x - this.radius * 3, this.y - this.radius * 3, this.radius * 6, this.radius * 6)
  }
}

const drawConnections = () => {
  const maxDistance = 120 * (0.8 + scrollProgress * 0.2)
  
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < maxDistance) {
        const opacity = (1 - distance / maxDistance) * 0.1 * (0.5 + scrollProgress * 0.5)
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }
}

const animate = () => {
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach(particle => {
    particle.update()
    particle.draw()
  })

  drawConnections()

  animationId = requestAnimationFrame(animate)
}

const resizeCanvas = () => {
  if (!containerRef.value || !canvasRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  
  // 重新初始化粒子位置
  particles.forEach(particle => {
    if (particle.x > canvas.width) particle.x = canvas.width
    if (particle.y > canvas.height) particle.y = canvas.height
  })
}

const handleScroll = (intersectionRatio) => {
  scrollProgress = intersectionRatio
}

let scrollObserver = null

onMounted(() => {
  if (!canvasRef.value) return
  
  canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  
  resizeCanvas()
  
  // 初始化粒子
  particles = []
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }
  
  animate()
  
  window.addEventListener('resize', resizeCanvas)
  
  // 监听滚动
  if (containerRef.value) {
    scrollObserver = useScrollObserver(containerRef, handleScroll)
    scrollObserver.observe()
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', resizeCanvas)
  if (scrollObserver) {
    scrollObserver.unobserve()
  }
})
</script>

<style scoped>
canvas {
  display: block;
}
</style>

