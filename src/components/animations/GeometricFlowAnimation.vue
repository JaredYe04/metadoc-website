<template>
  <div ref="containerRef" class="absolute inset-0 overflow-hidden pointer-events-none">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollObserver } from '../../utils/scrollObserver'
import { useDark } from '@vueuse/core'

const containerRef = ref(null)
const canvasRef = ref(null)
const isDark = useDark({
  storageKey: 'theme',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})
let canvas, ctx, animationId
let scrollProgress = 0
let time = 0
const codeLines = []
const nodes = []

// 根据主题获取颜色
const getColor = (opacity) => {
  if (isDark.value) {
    return `rgba(100, 116, 139, ${opacity})` // slate-500
  } else {
    return `rgba(148, 163, 184, ${opacity})` // slate-400
  }
}

class CodeLine {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.length = Math.random() * 100 + 50
    this.angle = Math.random() * Math.PI * 2
    this.speed = Math.random() * 0.5 + 0.2
    this.opacity = Math.random() * 0.3 + 0.1
    this.width = Math.random() * 1 + 0.5
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed * (0.5 + scrollProgress * 0.5)
    this.y += Math.sin(this.angle) * this.speed * (0.5 + scrollProgress * 0.5)
    
    // 边界处理
    if (this.x < -this.length || this.x > canvas.width + this.length) {
      this.x = Math.random() * canvas.width
    }
    if (this.y < -this.length || this.y > canvas.height + this.length) {
      this.y = Math.random() * canvas.height
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    ctx.strokeStyle = getColor(this.opacity * intensity * 1.5)  // 更明显
    ctx.lineWidth = this.width
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(
      this.x + Math.cos(this.angle) * this.length,
      this.y + Math.sin(this.angle) * this.length
    )
    ctx.stroke()
  }
}

class Node {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.vx = (Math.random() - 0.5) * 0.2
    this.vy = (Math.random() - 0.5) * 0.2
    this.size = Math.random() * 2 + 1
    this.pulsePhase = Math.random() * Math.PI * 2
  }

  update() {
    this.x += this.vx * (0.5 + scrollProgress * 0.5)
    this.y += this.vy * (0.5 + scrollProgress * 0.5)
    
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1
    
    this.x = Math.max(0, Math.min(canvas.width, this.x))
    this.y = Math.max(0, Math.min(canvas.height, this.y))
    
    this.pulsePhase += 0.03
  }

  draw() {
    const pulse = (Math.sin(this.pulsePhase) + 1) * 0.5
    const intensity = 0.3 + scrollProgress * 0.7
    const opacity = (0.5 + pulse * 0.3) * intensity  // 更明显
    
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size + pulse * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = getColor(opacity)
    ctx.fill()
  }
}

// 绘制信息网络
const drawInformationNetwork = () => {
  const intensity = 0.3 + scrollProgress * 0.7
  const maxDistance = 150 * (0.8 + scrollProgress * 0.2)
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < maxDistance) {
        const opacity = (1 - distance / maxDistance) * 0.2 * intensity  // 更明显
        ctx.strokeStyle = getColor(opacity)
        ctx.lineWidth = 0.8  // 更粗
        ctx.beginPath()
        ctx.moveTo(nodes[i].x, nodes[i].y)
        ctx.lineTo(nodes[j].x, nodes[j].y)
        ctx.stroke()
      }
    }
  }
}

// 绘制几何图案
const drawGeometricPatterns = () => {
  const intensity = 0.3 + scrollProgress * 0.7
  
  // 绘制多个旋转的几何图形
  for (let i = 0; i < 4; i++) {
    const angle = time * 0.2 + i * Math.PI * 2 / 4
    const radius = 60 + Math.sin(time * 0.3 + i) * 15 * intensity
    const centerX = canvas.width / 2 + Math.cos(angle) * 80 * intensity
    const centerY = canvas.height / 2 + Math.sin(angle) * 80 * intensity
    const rotation = time * 0.15 + i
    
    const opacity = 0.12 * intensity * (isDark.value ? 1 : 0.6)  // 更明显
    ctx.strokeStyle = getColor(opacity)
    ctx.lineWidth = 1.5  // 更粗
    
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation)
    
    // 绘制八边形
    ctx.beginPath()
    for (let j = 0; j < 8; j++) {
      const a = (j * Math.PI * 2) / 8
      const x = Math.cos(a) * radius
      const y = Math.sin(a) * radius
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()
    
    // 内部正方形
    ctx.beginPath()
    for (let j = 0; j < 4; j++) {
      const a = (j * Math.PI * 2) / 4 + Math.PI / 4
      const x = Math.cos(a) * radius * 0.7
      const y = Math.sin(a) * radius * 0.7
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
}

const animate = () => {
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  time += 0.01 * (0.5 + scrollProgress * 0.5)
  
  // 更新代码线
  codeLines.forEach(line => {
    line.update()
    line.draw()
  })
  
  // 更新节点
  nodes.forEach(node => {
    node.update()
    node.draw()
  })
  
  drawInformationNetwork()
  // 去掉中间旋转的图形
  
  animationId = requestAnimationFrame(animate)
}

const resizeCanvas = () => {
  if (!containerRef.value || !canvasRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  
  codeLines.forEach(line => {
    if (line.x > canvas.width) line.x = canvas.width
    if (line.y > canvas.height) line.y = canvas.height
  })
  
  nodes.forEach(node => {
    if (node.x > canvas.width) node.x = canvas.width
    if (node.y > canvas.height) node.y = canvas.height
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
  
  // 初始化代码线
  for (let i = 0; i < 30; i++) {
    codeLines.push(new CodeLine())
  }
  
  // 初始化节点
  for (let i = 0; i < 15; i++) {
    nodes.push(new Node())
  }
  
  animate()
  
  window.addEventListener('resize', resizeCanvas)
  
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
