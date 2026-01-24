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
const circuits = []
const gears = []
const nodes = []
const codeIcons = []
const extraIcons = []

// 根据主题获取颜色
const getColor = (opacity) => {
  if (isDark.value) {
    return `rgba(59, 130, 246, ${opacity})` // blue-500
  } else {
    return `rgba(147, 197, 253, ${opacity})` // blue-300
  }
}

// SVG路径解析函数
const parseSVGPath = (pathString) => {
  const path = new Path2D(pathString)
  return path
}

// 齿轮SVG路径
const gearSVGPath = "M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9l-1.28 2.22l-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24l-1.3-2.21l.8-.9a3 3 0 0 0 0-4l-.8-.9l1.28-2.2l1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24l1.28 2.22l-.8.9a3 3 0 0 0 0 3.98m-6.77-6a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2"

// 代码图标SVG路径
const codeIconSVGPath = "M14.62 2.662a1.5 1.5 0 0 1 1.04 1.85l-4.431 15.787a1.5 1.5 0 0 1-2.889-.81L12.771 3.7a1.5 1.5 0 0 1 1.85-1.039ZM7.56 6.697a1.5 1.5 0 0 1 0 2.12L4.38 12l3.182 3.182a1.5 1.5 0 1 1-2.122 2.121L1.197 13.06a1.5 1.5 0 0 1 0-2.12l4.242-4.243a1.5 1.5 0 0 1 2.122 0Zm8.88 2.12a1.5 1.5 0 1 1 2.12-2.12l4.243 4.242a1.5 1.5 0 0 1 0 2.121l-4.242 4.243a1.5 1.5 0 1 1-2.122-2.121L19.621 12z"

// 额外SVG图标路径
const extraIcon1Path = "M5 8H4l1.5-3L4 2h1l1 2l1-2h1L6.5 5L8 8H7L6 6M2 5V1H0V0h5v1H3v4m0 1v1H0V2h1v4"

const extraIcon3Path = "M12 5.793a28 28 0 0 1 3.342 2.865A28 28 0 0 1 18.207 12M12 5.793a28 28 0 0 0-3.342 2.865A28 28 0 0 0 5.793 12M12 5.793c3.57-2.584 6.947-3.554 8.354-2.147S20.791 8.43 18.207 12m0 0c2.584 3.57 3.554 6.947 2.147 8.354c-1.043 1.043-3.17.78-5.654-.48M18.207 12a28 28 0 0 1-2.865 3.342A28 28 0 0 1 12 18.207m0 0a28 28 0 0 1-3.342-2.865A28 28 0 0 1 5.793 12M12 18.207c-3.57 2.584-6.947 3.554-8.354 2.147S3.209 15.57 5.793 12m0 0C3.21 8.43 2.24 5.053 3.646 3.646c1.043-1.043 3.17-.78 5.654.48"

// 电路节点
class CircuitNode {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.size = Math.random() * 3 + 2
    this.pulsePhase = Math.random() * Math.PI * 2
    // 随机缓慢移动 - 使用目标速度，渐变改变方向
    this.targetVx = (Math.random() - 0.5) * 0.3
    this.targetVy = (Math.random() - 0.5) * 0.3
    this.vx = this.targetVx
    this.vy = this.targetVy
    this.moveTimer = 0
  }

  update() {
    this.pulsePhase += 0.05
    
    // 渐变改变移动方向
    this.moveTimer++
    if (this.moveTimer > 300) { // 每5秒左右改变方向
      this.targetVx = (Math.random() - 0.5) * 0.3
      this.targetVy = (Math.random() - 0.5) * 0.3
      this.moveTimer = 0
    }
    
    // 平滑过渡到目标速度
    this.vx += (this.targetVx - this.vx) * 0.01
    this.vy += (this.targetVy - this.vy) * 0.01
    
    // 平滑移动 - 确保即使scrollProgress为0时也能移动
    const speedMultiplier = 0.3 + scrollProgress * 0.7
    this.x += this.vx * speedMultiplier
    this.y += this.vy * speedMultiplier
    
    // 边界处理 - 使用CSS尺寸
    const cssWidth = canvas.width / (window.devicePixelRatio || 1)
    const cssHeight = canvas.height / (window.devicePixelRatio || 1)
    
    if (this.x <= 0 || this.x >= cssWidth) {
      this.vx *= -0.8
      this.targetVx *= -0.8
      this.x = Math.max(0, Math.min(cssWidth, this.x))
    }
    if (this.y <= 0 || this.y >= cssHeight) {
      this.vy *= -0.8
      this.targetVy *= -0.8
      this.y = Math.max(0, Math.min(cssHeight, this.y))
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    const pulse = (Math.sin(this.pulsePhase) + 1) * 0.5
    const opacity = (0.4 + pulse * 0.3) * intensity
    
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size + pulse, 0, Math.PI * 2)
    ctx.fillStyle = getColor(opacity)
    ctx.fill()
  }
}

// 电路连接线
class CircuitLine {
  constructor(node1, node2) {
    this.node1 = node1
    this.node2 = node2
    this.progress = 0
    this.speed = Math.random() * 0.02 + 0.01
  }

  update() {
    this.progress += this.speed * (0.5 + scrollProgress * 0.5)
    if (this.progress >= 1) {
      this.progress = 0
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    const opacity = 0.2 * intensity
    
    ctx.strokeStyle = getColor(opacity)
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(this.node1.x, this.node1.y)
    ctx.lineTo(this.node2.x, this.node2.y)
    ctx.stroke()
    ctx.setLineDash([])
    
    // 电流流动效果
    const flowX = this.node1.x + (this.node2.x - this.node1.x) * this.progress
    const flowY = this.node1.y + (this.node2.y - this.node1.y) * this.progress
    
    ctx.beginPath()
    ctx.arc(flowX, flowY, 2, 0, Math.PI * 2)
    ctx.fillStyle = getColor(opacity * 2)
    ctx.fill()
  }
}

// 齿轮 - 直接使用SVG路径
class Gear {
  constructor() {
    this.reset()
    this.path = parseSVGPath(gearSVGPath)
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.size = 60  // 放大，SVG是24x24，放大到60
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = 0.01  // 持续旋转
    this.opacity = Math.random() * 0.4 + 0.2
    // 随机缓慢移动 - 使用目标速度，渐变改变方向
    this.targetVx = (Math.random() - 0.5) * 0.2
    this.targetVy = (Math.random() - 0.5) * 0.2
    this.vx = this.targetVx
    this.vy = this.targetVy
    this.moveTimer = 0
  }

  update() {
    this.rotation += this.rotationSpeed * (0.5 + scrollProgress * 0.5)
    
    // 渐变改变移动方向
    this.moveTimer++
    if (this.moveTimer > 300) { // 每5秒左右改变方向
      this.targetVx = (Math.random() - 0.5) * 0.03
      this.targetVy = (Math.random() - 0.5) * 0.03
      this.moveTimer = 0
    }
    
    // 平滑过渡到目标速度
    this.vx += (this.targetVx - this.vx) * 0.01
    this.vy += (this.targetVy - this.vy) * 0.01
    
    // 平滑移动 - 确保即使scrollProgress为0时也能移动
    const speedMultiplier = 0.3 + scrollProgress * 0.7
    this.x += this.vx * speedMultiplier
    this.y += this.vy * speedMultiplier
    
    // 边界处理 - 使用CSS尺寸
    const cssWidth = canvas.width / (window.devicePixelRatio || 1)
    const cssHeight = canvas.height / (window.devicePixelRatio || 1)
    
    if (this.x <= 0 || this.x >= cssWidth) {
      this.vx *= -0.8
      this.targetVx *= -0.8
      this.x = Math.max(0, Math.min(cssWidth, this.x))
    }
    if (this.y <= 0 || this.y >= cssHeight) {
      this.vy *= -0.8
      this.targetVy *= -0.8
      this.y = Math.max(0, Math.min(cssHeight, this.y))
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    const currentOpacity = this.opacity * intensity
    
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)  // 持续旋转
    const scale = this.size / 24
    ctx.scale(scale, scale)
    ctx.translate(-12, -12)  // SVG viewBox是0 0 24 24，需要偏移到中心
    
    ctx.fillStyle = getColor(currentOpacity)
    ctx.strokeStyle = getColor(currentOpacity)
    ctx.lineWidth = 0.5 / scale
    
    // 直接使用SVG路径
    ctx.fill(this.path)
    ctx.stroke(this.path)
    
    ctx.restore()
  }
}

// 代码图标 - 直接使用SVG路径
class CodeIcon {
  constructor() {
    this.reset()
    this.path = parseSVGPath(codeIconSVGPath)
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.size = 50  // 放大，SVG是24x24，放大到50
    this.rotation = Math.random() * Math.PI * 2  // 初始角度偏移
    // 半分钟转一圈：2π / (30 * 60) ≈ 0.0035 每帧
    this.rotationSpeed = (2 * Math.PI) / (30 * 60)  // 半分钟转一圈
    this.opacity = Math.random() * 0.3 + 0.2
    // 随机缓慢移动 - 使用目标速度，渐变改变方向
    this.targetVx = (Math.random() - 0.5) * 0.2
    this.targetVy = (Math.random() - 0.5) * 0.2
    this.vx = this.targetVx
    this.vy = this.targetVy
    this.moveTimer = 0
  }

  update() {
    // 缓慢旋转
    this.rotation += this.rotationSpeed * (0.5 + scrollProgress * 0.5)
    
    // 渐变改变移动方向
    this.moveTimer++
    if (this.moveTimer > 300) { // 每5秒左右改变方向
      this.targetVx = (Math.random() - 0.5) * 0.03
      this.targetVy = (Math.random() - 0.5) * 0.03
      this.moveTimer = 0
    }
    
    // 平滑过渡到目标速度
    this.vx += (this.targetVx - this.vx) * 0.01
    this.vy += (this.targetVy - this.vy) * 0.01
    
    // 平滑移动 - 确保即使scrollProgress为0时也能移动
    const speedMultiplier = 0.3 + scrollProgress * 0.7
    this.x += this.vx * speedMultiplier
    this.y += this.vy * speedMultiplier
    
    // 边界处理 - 使用CSS尺寸
    const cssWidth = canvas.width / (window.devicePixelRatio || 1)
    const cssHeight = canvas.height / (window.devicePixelRatio || 1)
    
    if (this.x <= 0 || this.x >= cssWidth) {
      this.vx *= -0.8
      this.targetVx *= -0.8
      this.x = Math.max(0, Math.min(cssWidth, this.x))
    }
    if (this.y <= 0 || this.y >= cssHeight) {
      this.vy *= -0.8
      this.targetVy *= -0.8
      this.y = Math.max(0, Math.min(cssHeight, this.y))
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    const currentOpacity = this.opacity * intensity
    
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)  // 缓慢旋转
    const scale = this.size / 24
    ctx.scale(scale, scale)
    ctx.translate(-12, -12)  // SVG viewBox是0 0 24 24，需要偏移到中心
    
    ctx.fillStyle = getColor(currentOpacity)
    ctx.strokeStyle = getColor(currentOpacity)
    ctx.lineWidth = 0.5 / scale
    
    // 直接使用SVG路径
    ctx.fill(this.path)
    ctx.stroke(this.path)
    
    ctx.restore()
  }
}

// 额外图标1 - 8x8 viewBox
class ExtraIcon1 {
  constructor() {
    this.reset()
    this.path = parseSVGPath(extraIcon1Path)
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.size = 45
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (2 * Math.PI) / (30 * 60)  // 半分钟转一圈
    this.opacity = Math.random() * 0.3 + 0.2
    this.targetVx = (Math.random() - 0.5) * 0.03
    this.targetVy = (Math.random() - 0.5) * 0.03
    this.vx = this.targetVx
    this.vy = this.targetVy
    this.moveTimer = 0
  }

  update() {
    this.rotation += this.rotationSpeed * (0.5 + scrollProgress * 0.5)
    
    this.moveTimer++
    if (this.moveTimer > 300) {
      this.targetVx = (Math.random() - 0.5) * 0.2
      this.targetVy = (Math.random() - 0.5) * 0.2
      this.moveTimer = 0
    }
    
    this.vx += (this.targetVx - this.vx) * 0.01
    this.vy += (this.targetVy - this.vy) * 0.01
    
    // 平滑移动 - 确保即使scrollProgress为0时也能移动
    const speedMultiplier = 0.3 + scrollProgress * 0.7
    this.x += this.vx * speedMultiplier
    this.y += this.vy * speedMultiplier
    
    if (this.x <= 0 || this.x >= canvas.width) {
      this.vx *= -0.8
      this.targetVx *= -0.8
      this.x = Math.max(0, Math.min(canvas.width, this.x))
    }
    if (this.y <= 0 || this.y >= canvas.height) {
      this.vy *= -0.8
      this.targetVy *= -0.8
      this.y = Math.max(0, Math.min(canvas.height, this.y))
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    const currentOpacity = this.opacity * intensity
    
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    const scale = this.size / 8
    ctx.scale(scale, scale)
    ctx.translate(-4, -4)
    
    ctx.fillStyle = getColor(currentOpacity)
    ctx.strokeStyle = getColor(currentOpacity)
    ctx.lineWidth = 0.5 / scale
    
    ctx.fill(this.path)
    ctx.stroke(this.path)
    
    ctx.restore()
  }
}

// 额外图标3 - 24x24 viewBox，路径+圆形
class ExtraIcon3 {
  constructor() {
    this.reset()
    this.path = parseSVGPath(extraIcon3Path)
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.size = 50
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (2 * Math.PI) / (30 * 60)
    this.opacity = Math.random() * 0.3 + 0.2
    this.targetVx = (Math.random() - 0.5) * 0.03
    this.targetVy = (Math.random() - 0.5) * 0.03
    this.vx = this.targetVx
    this.vy = this.targetVy
    this.moveTimer = 0
  }

  update() {
    this.rotation += this.rotationSpeed * (0.5 + scrollProgress * 0.5)
    
    this.moveTimer++
    if (this.moveTimer > 300) {
      this.targetVx = (Math.random() - 0.5) * 0.2
      this.targetVy = (Math.random() - 0.5) * 0.2
      this.moveTimer = 0
    }
    
    this.vx += (this.targetVx - this.vx) * 0.01
    this.vy += (this.targetVy - this.vy) * 0.01
    
    // 平滑移动 - 确保即使scrollProgress为0时也能移动
    const speedMultiplier = 0.3 + scrollProgress * 0.7
    this.x += this.vx * speedMultiplier
    this.y += this.vy * speedMultiplier
    
    if (this.x <= 0 || this.x >= canvas.width) {
      this.vx *= -0.8
      this.targetVx *= -0.8
      this.x = Math.max(0, Math.min(canvas.width, this.x))
    }
    if (this.y <= 0 || this.y >= canvas.height) {
      this.vy *= -0.8
      this.targetVy *= -0.8
      this.y = Math.max(0, Math.min(canvas.height, this.y))
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    const currentOpacity = this.opacity * intensity
    
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    const scale = this.size / 24
    ctx.scale(scale, scale)
    ctx.translate(-12, -12)
    
    ctx.strokeStyle = getColor(currentOpacity)
    ctx.fillStyle = getColor(currentOpacity)
    ctx.lineWidth = 1.5 / scale
    
    // 绘制路径
    ctx.stroke(this.path)
    
    // 绘制中心圆形
    ctx.beginPath()
    ctx.arc(12, 12, 2, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
  }
}

const animate = () => {
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  time += 0.01 * (0.5 + scrollProgress * 0.5)
  
  // 更新节点
  nodes.forEach(node => {
    node.update()
    node.draw()
  })
  
  // 更新电路线
  circuits.forEach(circuit => {
    circuit.update()
    circuit.draw()
  })
  
  // 更新齿轮
  gears.forEach(gear => {
    gear.update()
    gear.draw()
  })
  
  // 更新代码图标
  codeIcons.forEach(icon => {
    icon.update()
    icon.draw()
  })
  
  // 更新额外图标
  extraIcons.forEach(icon => {
    icon.update()
    icon.draw()
  })
  
  animationId = requestAnimationFrame(animate)
}

const resizeCanvas = () => {
  if (!containerRef.value || !canvasRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  
  // 设置canvas的CSS尺寸（保持原始显示尺寸）
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  
  // 设置canvas的实际尺寸（考虑设备像素比）
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  
  // 重置并缩放上下文以匹配设备像素比
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)
  
  // 重新初始化 - 使用CSS尺寸而不是实际像素尺寸
  const cssWidth = rect.width
  const cssHeight = rect.height
  
  nodes.forEach(node => {
    if (node.x > cssWidth) node.x = cssWidth
    if (node.y > cssHeight) node.y = cssHeight
  })
  
  gears.forEach(gear => {
    if (gear.x > cssWidth) gear.x = cssWidth
    if (gear.y > cssHeight) gear.y = cssHeight
  })
  
  codeIcons.forEach(icon => {
    if (icon.x > cssWidth) icon.x = cssWidth
    if (icon.y > cssHeight) icon.y = cssHeight
  })
  
  extraIcons.forEach(icon => {
    if (icon.x > cssWidth) icon.x = cssWidth
    if (icon.y > cssHeight) icon.y = cssHeight
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
  
  // 初始化电路节点
  for (let i = 0; i < 15; i++) {
    nodes.push(new CircuitNode())
  }
  
  // 创建电路连接
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 200 && Math.random() < 0.3) {
        circuits.push(new CircuitLine(nodes[i], nodes[j]))
      }
    }
  }
  
  // 获取CSS尺寸（用于定位）
  const rect = containerRef.value.getBoundingClientRect()
  const cssWidth = rect.width
  const cssHeight = rect.height
  
  // 初始化齿轮 - 确保位置不重叠
  const gearPositions = [
    { x: cssWidth * 0.2, y: cssHeight * 0.3 },
    { x: cssWidth * 0.8, y: cssHeight * 0.7 },
    { x: cssWidth * 0.5, y: cssHeight * 0.5 }
  ]
  for (let i = 0; i < 3; i++) {
    const gear = new Gear()
    if (gearPositions[i]) {
      gear.x = gearPositions[i].x
      gear.y = gearPositions[i].y
    }
    gears.push(gear)
  }
  
  // 初始化代码图标 - 确保位置不重叠
  const codePositions = [
    { x: cssWidth * 0.15, y: cssHeight * 0.7 },
    { x: cssWidth * 0.85, y: cssHeight * 0.3 },
    { x: cssWidth * 0.3, y: cssHeight * 0.2 },
    { x: cssWidth * 0.7, y: cssHeight * 0.8 }
  ]
  for (let i = 0; i < 4; i++) {
    const icon = new CodeIcon()
    if (codePositions[i]) {
      icon.x = codePositions[i].x
      icon.y = codePositions[i].y
    }
    codeIcons.push(icon)
  }
  
  // 初始化额外图标 - 确保位置不重叠
  const extraPositions = [
    { x: cssWidth * 0.25, y: cssHeight * 0.15, type: 'icon1' },
    { x: cssWidth * 0.75, y: cssHeight * 0.85, type: 'icon3' },
    { x: cssWidth * 0.4, y: cssHeight * 0.6, type: 'icon3' },
    { x: cssWidth * 0.6, y: cssHeight * 0.4, type: 'icon1' },
    { x: cssWidth * 0.1, y: cssHeight * 0.5, type: 'icon3' },
    { x: cssWidth * 0.9, y: cssHeight * 0.5, type: 'icon1' }
  ]
  for (let i = 0; i < extraPositions.length; i++) {
    let icon
    if (extraPositions[i].type === 'icon1') {
      icon = new ExtraIcon1()
    } else {
      icon = new ExtraIcon3()
    }
    icon.x = extraPositions[i].x
    icon.y = extraPositions[i].y
    extraIcons.push(icon)
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
