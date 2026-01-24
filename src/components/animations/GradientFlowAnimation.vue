<template>
  <div ref="containerRef" class="absolute inset-0 overflow-hidden pointer-events-none z-0">
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
let lastMeteorTime = 0
const meteors = []
const emojis = []

// 根据主题获取颜色
const getColor = (opacity) => {
  if (isDark.value) {
    return `rgba(59, 130, 246, ${opacity})` // blue-500
  } else {
    return `rgba(147, 197, 253, ${opacity})` // blue-300
  }
}

class Meteor {
  constructor() {
    this.reset()
  }

  reset() {
    // 从任意边缘或随机位置开始，只要y轴会减小
    const edge = Math.random()
    if (edge < 0.25) {
      // 从上边缘
      this.x = Math.random() * (canvas?.width || window.innerWidth)
      this.y = -20
      this.vx = (Math.random() - 0.5) * 1.5
      this.vy = Math.random() * 5 + 4
    } else if (edge < 0.5) {
      // 从右边缘
      this.x = (canvas?.width || window.innerWidth) + 20
      this.y = Math.random() * (canvas?.height || window.innerHeight)
      this.vx = -(Math.random() * 3 + 2)
      this.vy = Math.random() * 5 + 4
    } else if (edge < 0.75) {
      // 从左边缘
      this.x = -20
      this.y = Math.random() * (canvas?.height || window.innerHeight)
      this.vx = Math.random() * 3 + 2
      this.vy = Math.random() * 5 + 4
    } else {
      // 从随机位置（但确保y会减小）
      this.x = Math.random() * (canvas?.width || window.innerWidth)
      this.y = Math.random() * (canvas?.height || window.innerHeight) * 0.3
      this.vx = (Math.random() - 0.5) * 2
      this.vy = Math.random() * 5 + 4
    }
    this.length = Math.random() * 30 + 20  // 更小
    this.opacity = Math.random() * 0.5 + 0.15  // 更透明
    this.life = 1
  }

  update() {
    this.x += this.vx * (0.5 + scrollProgress * 0.5)
    this.y += this.vy * (0.5 + scrollProgress * 0.5)
    this.life -= 0.01  // 更快消失
    
    // 如果y轴超出屏幕底部或生命值耗尽，重置（x轴不管）
    if (this.y > canvas.height + 50 || this.life <= 0) {
      this.reset()
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    const currentOpacity = this.opacity * this.life * intensity * 0.6  // 更透明
    
    // 绘制流星轨迹
    ctx.strokeStyle = getColor(currentOpacity)
    ctx.lineWidth = 1.5  // 更细
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x - this.vx * this.length, this.y - this.vy * this.length)
    ctx.stroke()
    
    // 绘制流星头部（光点）- 更小
    ctx.beginPath()
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
    ctx.fillStyle = getColor(currentOpacity * 1.5)
    ctx.fill()
    
    // 光晕效果 - 更小
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, 6
    )
    gradient.addColorStop(0, getColor(currentOpacity * 1.5))
    gradient.addColorStop(1, getColor(0))
    ctx.fillStyle = gradient
    ctx.fillRect(this.x - 6, this.y - 6, 12, 12)
  }
}

class Emoji {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = Math.random() * (canvas?.width || window.innerWidth)
    this.y = Math.random() * (canvas?.height || window.innerHeight)
    this.vx = (Math.random() - 0.5) * 0.8  // 更快
    this.vy = (Math.random() - 0.5) * 0.8  // 更快
    this.size = Math.random() * 12 + 10  // 更小
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.03  // 更快旋转
    this.opacity = Math.random() * 0.4 + 0.2  // 更透明
    this.life = 1
    this.fadeSpeed = Math.random() * 0.004 + 0.002  // 更快消失
    // 随机emoji
    const emojiList = ['✨', '⭐', '🌟', '💫', '⭐️', '🎉', '💎', '🔥', '⚡', '💡']
    this.emoji = emojiList[Math.floor(Math.random() * emojiList.length)]
  }

  update() {
    this.x += this.vx * (0.5 + scrollProgress * 0.5)
    this.y += this.vy * (0.5 + scrollProgress * 0.5)
    this.rotation += this.rotationSpeed
    this.life -= this.fadeSpeed
    
    // 边界反弹
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1
    
    this.x = Math.max(0, Math.min(canvas.width, this.x))
    this.y = Math.max(0, Math.min(canvas.height, this.y))
    
    // 如果生命值耗尽，重置
    if (this.life <= 0) {
      this.reset()
    }
  }

  draw() {
    const intensity = 0.3 + scrollProgress * 0.7
    const currentOpacity = this.opacity * this.life * intensity * 0.6  // 更透明
    
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.globalAlpha = currentOpacity
    
    // 绘制emoji
    ctx.font = `${this.size}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.emoji, 0, 0)
    
    // 光晕效果
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size)
    gradient.addColorStop(0, getColor(currentOpacity * 0.3))
    gradient.addColorStop(1, getColor(0))
    ctx.fillStyle = gradient
    ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2)
    
    ctx.restore()
  }
}

const animate = () => {
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  time += 0.01 * (0.5 + scrollProgress * 0.5)
  
  // 每2-3秒创建一颗新流星
  const currentTime = Date.now()
  const timeSinceLastMeteor = (currentTime - lastMeteorTime) / 1000 // 秒
  if (timeSinceLastMeteor > (2 + Math.random()) && meteors.length < 2) {
    meteors.push(new Meteor())
    lastMeteorTime = currentTime
  }
  
  // 定期创建新emoji - 更少
  if (Math.random() < 0.005 * (0.5 + scrollProgress * 0.5) && emojis.length < 8) {
    emojis.push(new Emoji())
  }
  
  // 更新和绘制流星
  meteors.forEach(meteor => {
    meteor.update()
    meteor.draw()
  })
  
  // 更新和绘制emoji
  emojis.forEach(emoji => {
    emoji.update()
    emoji.draw()
  })
  
  // 移除完成的元素
  meteors.forEach((meteor, index) => {
    if (meteor.life <= 0) {
      meteors.splice(index, 1)
    }
  })
  
  emojis.forEach((emoji, index) => {
    if (emoji.life <= 0) {
      emojis.splice(index, 1)
    }
  })
  
  animationId = requestAnimationFrame(animate)
}

const resizeCanvas = () => {
  if (!containerRef.value || !canvasRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  
  // 重新初始化元素位置
  meteors.forEach(meteor => {
    if (meteor.y > canvas.height) meteor.reset()
  })
  
  emojis.forEach(emoji => {
    if (emoji.x > canvas.width) emoji.x = canvas.width
    if (emoji.y > canvas.height) emoji.y = canvas.height
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
  
  // 初始化一些流星和emoji - 更少
  lastMeteorTime = Date.now()
  
  for (let i = 0; i < 3; i++) {
    emojis.push(new Emoji())
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
