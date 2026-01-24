<template>
  <div ref="containerRef" class="absolute inset-0 overflow-hidden pointer-events-none z-0 grid-fade-mask">
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
let gridSize = 100  // 更大的网格
let columns, rows
let time = 0
let scrollProgress = 0

// 根据主题获取颜色
const getColor = (opacity) => {
  if (isDark.value) {
    return `rgba(59, 130, 246, ${opacity})` // blue-500
  } else {
    return `rgba(147, 197, 253, ${opacity})` // blue-300
  }
}

const updateAnimation = () => {
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  const intensity = 0.3 + scrollProgress * 0.7
  const moveSpeed = 0.5 + scrollProgress * 0.5
  
  time += moveSpeed * 0.01
  
  // 绘制网格 - 只有移动，没有波动
  ctx.strokeStyle = getColor(0.05 + scrollProgress * 0.08)
  ctx.lineWidth = 1
  
  // 45度旋转的网格，简单的平移移动效果
  const offsetX = (time * 10) % gridSize
  const offsetY = (time * 10) % gridSize
  
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(Math.PI / 4) // 45度旋转
  ctx.translate(-canvas.width / 2, -canvas.height / 2)
  
  // 扩大范围，超出屏幕边缘
  const extraCols = 3
  const extraRows = 3
  for (let i = -extraCols; i <= columns + extraCols; i++) {
    for (let j = -extraRows; j <= rows + extraRows; j++) {
      const x = i * gridSize - offsetX
      const y = j * gridSize - offsetY
      
      ctx.beginPath()
      ctx.moveTo(x, y)
      
      // 连接到相邻点
      ctx.lineTo(x + gridSize, y)
      ctx.lineTo(x, y + gridSize)
      
      ctx.stroke()
    }
  }
  
  ctx.restore()
  
  // 添加光晕效果
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) / 2
  )
  gradient.addColorStop(0, getColor(0.02 * scrollProgress))
  gradient.addColorStop(1, getColor(0))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  animationId = requestAnimationFrame(updateAnimation)
}

const resizeCanvas = () => {
  if (!containerRef.value || !canvasRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  
  columns = Math.ceil(canvas.width / gridSize) + 1
  rows = Math.ceil(canvas.height / gridSize) + 1
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
  updateAnimation()
  
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

.grid-fade-mask {
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 10%,
    black 15%,
    black 85%,
    transparent 90%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 10%,
    black 15%,
    black 85%,
    transparent 90%,
    transparent 100%
  );
}
</style>
