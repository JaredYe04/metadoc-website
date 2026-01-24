<template>
  <div ref="containerRef" class="absolute inset-0 overflow-hidden pointer-events-none">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useScrollObserver, getScrollProgress } from '../../utils/scrollObserver'
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
let gridSize = 50
let columns, rows
let time = 0
let scrollProgress = 0

// 根据主题获取颜色
const getColor = (opacity) => {
  if (isDark.value) {
    // 暗色模式：深蓝色调
    return `rgba(59, 130, 246, ${opacity})` // blue-500
  } else {
    // 亮色模式：浅蓝色调
    return `rgba(147, 197, 253, ${opacity})` // blue-300
  }
}

const updateAnimation = () => {
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 根据滚动进度调整动画强度
  const intensity = 0.3 + scrollProgress * 0.7
  const waveSpeed = 0.5 + scrollProgress * 0.5
  
  time += waveSpeed * 0.02
  
  // 绘制网格波浪 - 更透明
  ctx.strokeStyle = getColor(0.03 + scrollProgress * 0.05)
  ctx.lineWidth = 1
  
  for (let i = 0; i <= columns; i++) {
    for (let j = 0; j <= rows; j++) {
      const x = i * gridSize
      const y = j * gridSize
      
      // 波浪效果
      const waveX = Math.sin(time + i * 0.1) * intensity * 10
      const waveY = Math.cos(time + j * 0.1) * intensity * 10
      
      ctx.beginPath()
      ctx.moveTo(x + waveX, y + waveY)
      
      // 连接到相邻点
      if (i < columns) {
        const nextX = (i + 1) * gridSize
        const nextWaveX = Math.sin(time + (i + 1) * 0.1) * intensity * 10
        const nextWaveY = Math.cos(time + j * 0.1) * intensity * 10
        ctx.lineTo(nextX + nextWaveX, y + nextWaveY)
      }
      
      if (j < rows) {
        const nextY = (j + 1) * gridSize
        const nextWaveX = Math.sin(time + i * 0.1) * intensity * 10
        const nextWaveY = Math.cos(time + (j + 1) * 0.1) * intensity * 10
        ctx.lineTo(x + nextWaveX, nextY + nextWaveY)
      }
      
      ctx.stroke()
    }
  }
  
  // 添加光晕效果 - 更透明
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) / 2
  )
  gradient.addColorStop(0, getColor(0.01 * scrollProgress))
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
  
  columns = Math.ceil(canvas.width / gridSize)
  rows = Math.ceil(canvas.height / gridSize)
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

